import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import render from './renders';
import parse from './parser';
import { isUrlValid, isUrlDuplicated } from './utils';
import resources from './locales';

const validate = (state) => {
  const errors = {};
  const rssUrl = state.form.url;
  const urlsList = state.urls;
  if (rssUrl === '') {
    errors.status = 'notValidated';
  } else if (isUrlValid(rssUrl) && !isUrlDuplicated(rssUrl, urlsList)) {
    errors.status = 'valid';
  } else if (isUrlValid(rssUrl) && isUrlDuplicated(rssUrl, urlsList)) {
    errors.status = 'invalid';
    errors.type = 'input';
    errors.err = 'addedUrl';
  } else {
    errors.status = 'invalid';
    errors.type = 'input';
    errors.err = 'invalidUrl';
  }
  return errors;
};

export default () => {
  const state = {
    form: {
      processState: 'filling', // => filling | sending | finished
      validationState: 'valid', // => valid | invalid | notValidated
      url: '',
    },
    channels: [],
    posts: [],
    urls: [],
    errors: {},
  };

  const inputField = document.getElementById('inputField');
  const inputForm = document.getElementById('inputForm');
  const proxy = 'cors-anywhere.herokuapp.com';
  const updateDelay = 5000;

  const updateValidationState = () => {
    const errors = validate(state);
    state.errors = errors;
    state.form.validationState = state.errors.status;
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
    state.form.processState = 'filling';
    updateValidationState();
  });

  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rssUrl = state.form.url;
    const link = `https://${proxy}/${rssUrl}`;
    state.form.processState = 'sending';
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
        state.form.processState = 'finished';
      })
      .catch((error) => {
        if (error.response) {
          state.errors = { err: error.response.status, type: 'httpClient' };
        } else {
          state.errors = { err: error.message, type: 'httpClient' };
        }
        state.form.processState = 'finished';
      });
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
