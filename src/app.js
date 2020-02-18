import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import render from './renders';
import parse from './parser';
import resources from './locales';

const state = {
  form: {
    inputProcessState: 'filling', // => filling | done
    validationState: 'valid',
    url: '',
  },
  currentPosts: [],
  allPosts: [],
  newPosts: [],
  feeds: [],
  validateResultMessage: '',
  errorMessage: '',
};

const inputField = document.getElementById('url');
const inputForm = document.getElementById('inputForm');
const proxy = 'cors-anywhere.herokuapp.com';

const checkoutFeedUrlSchema = yup.string().url().required();
const isUrlValid = (url) => checkoutFeedUrlSchema.isValid(url).then((valid) => valid);
const isUrlDuplicated = (url) => state.feeds.includes(url);

i18next.init({
  debug: true,
  lng: 'en',
  resources,
  fallbackLng: 'en',
  keySeparator: '.',
});

const validate = () => {
  isUrlValid(state.form.url).then((valid) => {
    state.form.inputProcessState = 'filling';
    if (valid && !isUrlDuplicated(state.form.url)) {
      state.validateResultMessage = '';
      state.form.validationState = 'valid';
    } else if (state.form.url === '') {
      state.form.validationState = 'notValidated';
      state.validateResultMessage = '';
    } else if (valid && isUrlDuplicated(state.form.url)) {
      state.validateResultMessage = i18next.t('validateResultMessages.addedUrl');
      state.form.validationState = 'invalid';
    } else {
      state.validateResultMessage = i18next.t('validateResultMessages.invalidUrl');
      state.form.validationState = 'invalid';
    }
  });
};

const updateFeed = () => {
  const feedUrls = state.feeds;
  state.newPosts = [];
  feedUrls.forEach((url) => {
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
      state.newPosts = Array.from(new Set(newFeedPosts));
    });
  });
  setTimeout(updateFeed, 5000);
};


export default () => {
  inputField.addEventListener('input', (e) => {
    state.errorMessage = '';
    state.form.url = e.target.value;
    validate(state);
  });

  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rssUrl = state.form.url;
    state.feeds.push(rssUrl);
    const link = `https://${proxy}/${rssUrl}`;

    axios.get(link)
      .then((response) => {
        const feedData = parse(response.data);
        const { feedPosts } = feedData;
        state.currentPosts = feedData;
        state.allPosts = [...state.allPosts, ...feedPosts];
      })
      .catch((err) => {
        if (err.message === 'Network Error') {
          state.errorMessage = i18next.t('errorMessages.networkError');
        } else if (err.response) {
          const errorStatus = err.response.status;
          switch (errorStatus) {
            case 404:
              state.errorMessage = i18next.t('errorMessages.error404');
              break;
            case 406:
              state.errorMessage = i18next.t('errorMessages.error406');
              break;
            case 500:
              state.errorMessage = i18next.t('errorMessages.error500');
              break;
            default:
              state.errorMessage = i18next.t('errorMessages.unknownError');
          }
        } else {
          state.errorMessage = i18next.t('errorMessages.unknownError');
        }
      });
    state.form.inputProcessState = 'done';
  });

  updateFeed();

  render(state);
};
