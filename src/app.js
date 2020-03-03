import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import render from './renders';
import parse from './parser';
import resources from './locales';

export default () => {
  const state = {
    form: {
      inputProcessState: 'filling', // => filling | done
      validationState: 'valid',
      url: '',
    },
    channels: [],
    posts: [],
    urls: [],
    errors: {},
  };

  const inputField = document.getElementById('url');
  const inputForm = document.getElementById('inputForm');
  const proxy = 'cors-anywhere.herokuapp.com';
  const postsLinks = [];

  const checkoutFeedUrlSchema = yup.string().url().required();
  const isUrlValid = (url) => checkoutFeedUrlSchema.isValid(url).then((valid) => valid);
  const isUrlDuplicated = (url) => state.urls.includes(url);

  const validate = (url) => {
    isUrlValid(url).then((valid) => {
      state.form.inputProcessState = 'filling';
      if (valid && !isUrlDuplicated(url)) {
        state.form.validationState = 'valid';
        state.errors = {};
      } else if (url === '') {
        state.form.validationState = 'notValidated';
        state.errors = {};
      } else if (valid && isUrlDuplicated(url)) {
        state.form.validationState = 'invalid';
        state.errors = { err: 'addedUrl', errType: 'input' };
      } else {
        state.form.validationState = 'invalid';
        state.errors = { err: 'invalidUrl', errType: 'input' };
      }
    });
  };

  const updateFeed = () => {
    state.urls.forEach((url) => {
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

  inputField.addEventListener('input', (e) => {
    state.form.url = e.target.value;
    validate(state.form.url);
  });

  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rssUrl = state.form.url;
    const link = `https://${proxy}/${rssUrl}`;
    axios.get(link)
      .then((response) => {
        state.urls.push(rssUrl);
        const feedData = parse(response.data);
        const { title, description, posts } = feedData;
        const channelInfo = { title, description };
        posts.forEach((post) => postsLinks.push(post.postLink));
        state.channels = [channelInfo];
        state.posts = [...posts].reverse();
      })
      .catch((error) => {
        if (error.response) {
          state.errors = { err: error.response.status, errType: 'httpClient' };
        } else {
          state.errors = { err: error.message, errType: 'httpClient' };
        }
      });
    state.form.inputProcessState = 'done';
  });

  i18next.init({
    debug: true,
    lng: 'en',
    resources,
    fallbackLng: 'en',
    keySeparator: '.',
  });

  updateFeed();

  render(state);
};
