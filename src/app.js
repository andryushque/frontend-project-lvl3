import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import render from './renders';
import parse from './parser';
import translationEN from './locales/en/translation.json';

const state = {
  form: {
    inputProcessState: 'filling', // => filling | done
    validationState: 'valid',
    inputedUrl: '',
  },
  feed: {
    currentPosts: [],
    allPosts: [],
    allPostsCount: 0,
    newPosts: [],
  },
  urlList: [],
  validateResultMessage: '',
  errorMessage: '',
};

export default () => {
  const inputForm = document.getElementById('url');
  const button = document.querySelector('.btn');

  const checkoutFeedUrlSchema = yup.string().url().required();
  const isUrlValid = (url) => checkoutFeedUrlSchema.isValid(url).then((valid) => valid);
  const isUrlDuplicated = (url) => state.urlList.includes(url);

  const proxy = 'cors-anywhere.herokuapp.com';

  const resources = {
    en: { translation: translationEN },
  };

  const options = {
    debug: true,
    lng: 'en',
    resources,
    fallbackLng: 'en',
    keySeparator: '.',
  };

  inputForm.addEventListener('input', (e) => {
    state.errorMessage = '';
    state.form.inputedUrl = e.target.value;

    isUrlValid(state.form.inputedUrl).then((valid) => {
      i18next.init(options).then((t) => {
        if (valid && !isUrlDuplicated(state.form.inputedUrl)) {
          state.form.inputProcessState = 'filling';
          state.validateResultMessage = '';
          state.form.validationState = 'valid';
        } else if (state.form.inputedUrl === '') {
          state.form.inputProcessState = 'filling';
          state.form.validationState = 'notValidated';
          state.validateResultMessage = '';
        } else if (valid && isUrlDuplicated(state.form.inputedUrl)) {
          state.form.inputProcessState = 'filling';
          state.validateResultMessage = t('validateResultMessages.addedUrl');
          state.form.validationState = 'invalid';
        } else {
          state.form.inputProcessState = 'filling';
          state.validateResultMessage = t('validateResultMessages.invalidUrl');
          state.form.validationState = 'invalid';
        }
      });
    });
  });

  button.addEventListener('click', () => {
    const url = state.form.inputedUrl;
    state.urlList.push(url);
    const link = `https://${proxy}/${url}`;

    i18next.init(options)
      .then((t) => {
        axios.get(link)
          .then((response) => {
            const feedData = parse(response.data);
            const { feedPosts } = feedData;
            state.feed.currentPosts = feedData;
            state.feed.allPosts = [...state.feed.allPosts, ...feedPosts];
            state.feed.allPostsCount = state.feed.allPosts.length;
          })
          .catch((err) => {
            if (err.message === 'Network Error') {
              state.errorMessage = t('errorMessages.networkError');
            } else if (err.response) {
              const errorStatus = err.response.status;
              switch (errorStatus) {
                case 404:
                  state.errorMessage = t('errorMessages.error404');
                  break;
                case 406:
                  state.errorMessage = t('errorMessages.error406');
                  break;
                case 500:
                  state.errorMessage = t('errorMessages.error500');
                  break;
                default:
                  state.errorMessage = t('errorMessages.unknownError');
              }
            } else {
              state.errorMessage = t('errorMessages.unknownError');
            }
          });
      });
    state.form.inputProcessState = 'done';
  });

  const updateFeed = () => {
    const feedUrlList = state.urlList;
    state.feed.newPosts = [];
    feedUrlList.forEach((url) => {
      const link = `https://${proxy}/${url}`;
      axios.get(link).then((response) => {
        const { feedPosts } = parse(response.data);
        return feedPosts;
      }).then((feedPosts) => {
        const allFeedPosts = state.feed.allPosts;
        const allFeedPostsLinks = [];
        allFeedPosts.forEach((post) => allFeedPostsLinks.push(post.postLink));
        const newFeedPosts = [];
        feedPosts.forEach((feedPost) => {
          if (!allFeedPostsLinks.includes(feedPost.postLink)) {
            newFeedPosts.push(feedPost);
          }
          return newFeedPosts;
        });
        state.feed.allPosts = [...state.feed.allPosts, ...newFeedPosts];
        state.feed.allPostsCount = state.feed.allPosts.length;
        state.feed.newPosts = [...newFeedPosts];
      });
    });
    setTimeout(updateFeed, 5000);
  };

  updateFeed();
  render(state);
};
