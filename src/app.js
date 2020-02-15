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
    inputProcessState: 'inProcess', // => inProcess | done
    validationState: true,
    inputedUrl: '',
  },
  feed: {
    currentPosts: [],
    allPosts: [],
    postsCount: 0,
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
    state.form.inputedUrl = e.target.value;
    state.errorMessage = '';

    isUrlValid(state.form.inputedUrl).then((valid) => {
      i18next.init(options).then((t) => {
        if (valid && !isUrlDuplicated(state.form.inputedUrl)) {
          state.form.validationState = true;
          state.validateResultMessage = '';
        } else if (valid && isUrlDuplicated(state.form.inputedUrl)) {
          state.validateResultMessage = t('validateResultMessages.addedUrl');
          state.form.validationState = false;
        } else {
          state.validateResultMessage = t('validateResultMessages.invalidUrl');
          state.form.validationState = false;
        }
      });
    });
    state.form.inputProcessState = 'inProcess';
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
            state.feed.postsCount = state.feed.allPosts.length;
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
        state.form.inputProcessState = 'done';
      });
  });

  const updateFeed = () => {
    const feedUrls = state.urlList;
    state.feed.newPosts = [];
    feedUrls.forEach((url) => {
      const link = `https://${proxy}/${url}`;
      axios.get(link).then((response) => {
        const { feedPosts } = parse(response.data);
        return feedPosts;
      }).then((feedPosts) => {
        const currentFeedData = state.feed.allPosts;
        const currentPostsLink = [];
        currentFeedData.forEach((post) => currentPostsLink.push(post.postLink));
        const newArticles = [];
        feedPosts.forEach((feedPost) => {
          if (!currentPostsLink.includes(feedPost.postLink)) {
            newArticles.push(feedPost);
          }
          return newArticles;
        });
        state.feed.allPosts = [...state.feed.allPosts, ...newArticles];
        state.feed.postsCount = state.feed.allPosts.length;
        state.feed.newPosts = [...newArticles];
      });
    });
    setTimeout(updateFeed, 5000);
  };
  updateFeed();
  render(state);
};
