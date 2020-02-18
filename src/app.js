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
  channels: [],
  posts: [],
  validateResultMessage: '',
  errorMessage: '',
};

const inputField = document.getElementById('url');
const inputForm = document.getElementById('inputForm');
const proxy = 'cors-anywhere.herokuapp.com';

const postsLinks = [];
const urls = [];

const checkoutFeedUrlSchema = yup.string().url().required();
const isUrlValid = (url) => checkoutFeedUrlSchema.isValid(url).then((valid) => valid);
const isUrlDuplicated = (url) => urls.includes(url);

i18next.init({
  debug: true,
  lng: 'en',
  resources,
  fallbackLng: 'en',
  keySeparator: '.',
});

const validate = (url) => {
  isUrlValid(url).then((valid) => {
    state.form.inputProcessState = 'filling';
    if (valid && !isUrlDuplicated(url)) {
      state.validateResultMessage = '';
      state.form.validationState = 'valid';
    } else if (state.form.url === '') {
      state.form.validationState = 'notValidated';
      state.validateResultMessage = '';
    } else if (valid && isUrlDuplicated(url)) {
      state.validateResultMessage = i18next.t('validateResultMessages.addedUrl');
      state.form.validationState = 'invalid';
    } else {
      state.validateResultMessage = i18next.t('validateResultMessages.invalidUrl');
      state.form.validationState = 'invalid';
    }
  });
};

const updateFeed = () => {
  urls.forEach((url) => {
    const link = `https://${proxy}/${url}`;
    axios.get(link).then((response) => {
      const { posts } = parse(response.data);
      const filteredNewPosts = [];
      posts.forEach((post) => {
        if (!postsLinks.includes(post.postLink)) {
          filteredNewPosts.unshift(post);
          postsLinks.push(post.postLink);
        }
      });
      state.posts = [...filteredNewPosts];
    });
  });
  setTimeout(updateFeed, 5000);
};

export default () => {
  inputField.addEventListener('input', (e) => {
    state.errorMessage = '';
    state.form.url = e.target.value;
    validate(state.form.url);
  });

  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rssUrl = state.form.url;
    urls.push(rssUrl);
    const link = `https://${proxy}/${rssUrl}`;

    axios.get(link)
      .then((response) => {
        const feedData = parse(response.data);
        const { title, description, posts } = feedData;
        const channelInfo = { title, description };
        posts.forEach((post) => postsLinks.push(post.postLink));
        state.channels = [channelInfo];
        state.posts = [...posts].reverse();
      })
      .catch((err) => {
        if (!err.response) {
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
