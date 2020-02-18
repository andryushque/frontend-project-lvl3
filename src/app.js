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
    url: '',
  },
  currentPosts: [],
  allPosts: [],
  allPostsCount: 0,
  newPosts: [],
  urlList: [],
  validateResultMessage: '',
  errorMessage: '',
};

export default () => {
  const inputField = document.getElementById('url');
  const inputForm = document.getElementById('inputForm');

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

  inputField.addEventListener('input', (e) => {
    state.errorMessage = '';
    state.form.url = e.target.value;

    isUrlValid(state.form.url).then((valid) => {
      i18next.init(options).then((t) => {
        state.form.inputProcessState = 'filling';
        if (valid && !isUrlDuplicated(state.form.url)) {
          state.validateResultMessage = '';
          state.form.validationState = 'valid';
        } else if (state.form.url === '') {
          state.form.validationState = 'notValidated';
          state.validateResultMessage = '';
        } else if (valid && isUrlDuplicated(state.form.url)) {
          state.validateResultMessage = t('validateResultMessages.addedUrl');
          state.form.validationState = 'invalid';
        } else {
          state.validateResultMessage = t('validateResultMessages.invalidUrl');
          state.form.validationState = 'invalid';
        }
      });
    });
  });

  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rssUrl = state.form.url;
    state.urlList.push(rssUrl);
    const link = `https://${proxy}/${rssUrl}`;

    i18next.init(options)
      .then((t) => {
        axios.get(link)
          .then((response) => {
            const feedData = parse(response.data);
            const { feedPosts } = feedData;
            state.currentPosts = feedData;
            state.allPosts = [...state.allPosts, ...feedPosts];
            state.allPostsCount = state.allPosts.length;
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
    state.newPosts = [];
    feedUrlList.forEach((url) => {
      const link = `https://${proxy}/${url}`;
      axios.get(link).then((response) => {
        const { feedPosts } = parse(response.data);
        return feedPosts;
      }).then((feedPosts) => {
        const allFeedPosts = state.allPosts;
        const allFeedPostsLinks = [];
        allFeedPosts.forEach((post) => allFeedPostsLinks.push(post.postLink));
        const newFeedPosts = [];
        feedPosts.forEach((feedPost) => {
          if (!allFeedPostsLinks.includes(feedPost.postLink)) {
            newFeedPosts.unshift(feedPost);
          }
          return newFeedPosts;
        });
        state.allPosts = [...state.allPosts, ...newFeedPosts];
        state.allPostsCount = state.allPosts.length;
        state.newPosts = Array.from(new Set(newFeedPosts));
      });
    });
    setTimeout(updateFeed, 5000);
  };

  updateFeed();
  render(state);
};
