import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import render from './renders';
import parse from './parser';
import { isUrlValid, isUrlDuplicated } from './validator';
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
  const updateDelay = 5000;

  const updateValidationState = () => {
    const rssUrl = state.form.url;
    const urlsList = state.urls;
    state.form.inputProcessState = 'filling';
    if (rssUrl === '') {
      state.form.validationState = 'notValidated';
      state.errors = {};
    } else if (isUrlValid(rssUrl) && !isUrlDuplicated(rssUrl, urlsList)) {
      state.form.validationState = 'valid';
      state.errors = {};
    } else if (isUrlValid(rssUrl) && isUrlDuplicated(rssUrl, urlsList)) {
      state.form.validationState = 'invalid';
      state.errors = { err: 'addedUrl', errType: 'input' };
    } else {
      state.form.validationState = 'invalid';
      state.errors = { err: 'invalidUrl', errType: 'input' };
    }
  };

  const updateFeed = () => {
    state.urls.forEach((url) => {
      const link = `https://${proxy}/${url}`;
      axios.get(link).then((response) => {
        const { posts } = parse(response.data);
        const currentPosts = state.posts;
        const newPosts = _.differenceBy(posts, currentPosts, 'postLink');
        newPosts.forEach((newPost) => {
          const { postTitle, postLink } = newPost;
          const postId = _.uniqueId('post_');
          state.posts.unshift({ postTitle, postLink, postId });
        });
      });
    });
    setTimeout(updateFeed, updateDelay);
  };

  inputField.addEventListener('input', (e) => {
    state.form.url = e.target.value;
    updateValidationState();
  });

  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rssUrl = state.form.url;
    const link = `https://${proxy}/${rssUrl}`;
    axios.get(link)
      .then((response) => {
        const feedData = parse(response.data);
        const { title, description, posts } = feedData;
        const channel = { title, description, channelId: _.uniqueId('channel_') };
        state.channels.push(channel);
        posts.forEach((post) => {
          const { postTitle, postLink } = post;
          state.posts.unshift({ postTitle, postLink, postId: _.uniqueId('post_') });
        });
        state.urls.push(rssUrl);
      })
      .catch((error) => {
        if (error.response) {
          state.errors = { err: error.response.status, errType: 'httpClient' };
        } else {
          state.errors = { err: error.message, errType: 'httpClient' };
        }
      });
    state.form.inputProcessState = 'done';
    setTimeout(updateFeed, updateDelay);
  });

  i18next.init({
    debug: true,
    lng: 'en',
    resources,
    fallbackLng: 'en',
    keySeparator: '.',
  });

  render(state);
};
