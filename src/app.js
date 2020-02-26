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
    errors: {},
  };

  const inputField = document.getElementById('url');
  const inputForm = document.getElementById('inputForm');
  const proxy = 'cors-anywhere.herokuapp.com';
  const postsLinks = [];
  const urls = [];

  const validate = () => {
    const checkoutFeedUrlSchema = yup.string().url().required();
    const isUrlValid = (url) => checkoutFeedUrlSchema.isValid(url).then((valid) => valid);
    const isUrlDuplicated = (url) => urls.includes(url);

    const rssUrl = state.form.url;
    isUrlValid(rssUrl).then((valid) => {
      state.form.inputProcessState = 'filling';
      if (valid && !isUrlDuplicated(rssUrl)) {
        state.form.validationState = 'valid';
        state.errors = {};
      } else if (state.form.url === '') {
        state.form.validationState = 'notValidated';
        state.errors = {};
      } else if (valid && isUrlDuplicated(rssUrl)) {
        state.form.validationState = 'invalid';
        state.errors = { err: 'addedUrl', errType: 'input' };
      } else {
        state.form.validationState = 'invalid';
        state.errors = { err: 'invalidUrl', errType: 'input' };
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

  inputField.addEventListener('input', (e) => {
    state.form.url = e.target.value;
    validate(state);
  });

  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rssUrl = state.form.url;
    const link = `https://${proxy}/${rssUrl}`;
    axios.get(link)
      .then((response) => {
        urls.push(rssUrl);
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
    updateFeed(state);
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
