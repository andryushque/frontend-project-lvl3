import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import render from './renders';
import parse from './parser';
import resources from './locales';

const postsLinks = [];

i18next.init({
  debug: true,
  lng: 'en',
  resources,
  fallbackLng: 'en',
  keySeparator: '.',
});

const validate = (state) => {
  const { form, feed } = state;

  const checkoutFeedUrlSchema = yup.string().url().required();
  const isUrlValid = (url) => checkoutFeedUrlSchema.isValid(url).then((valid) => valid);
  const isUrlDuplicated = (url) => feed.urls.includes(url);

  const rssUrl = form.url;
  isUrlValid(rssUrl).then((valid) => {
    form.inputProcessState = 'filling';
    if (valid && !isUrlDuplicated(rssUrl)) {
      form.validationState = 'valid';
      feed.errors = {};
    } else if (state.form.url === '') {
      form.validationState = 'notValidated';
      feed.errors = {};
    } else if (valid && isUrlDuplicated(rssUrl)) {
      form.validationState = 'invalid';
      feed.errors = { err: 'addedUrl', errType: 'input' };
    } else {
      form.validationState = 'invalid';
      feed.errors = { err: 'invalidUrl', errType: 'input' };
    }
  });
};

export default () => {
  const state = {
    form: {
      inputProcessState: 'filling', // => filling | done
      validationState: 'valid',
      url: '',
    },
    feed: {
      channels: [],
      posts: [],
      urls: [],
      errors: {},
    },
  };

  const inputField = document.getElementById('url');
  const inputForm = document.getElementById('inputForm');
  const proxy = 'cors-anywhere.herokuapp.com';

  const updateFeed = () => {
    state.feed.urls.forEach((url) => {
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
        state.feed.posts = [...filteredNewPosts];
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
        state.feed.urls.push(rssUrl);
        const feedData = parse(response.data);
        const { title, description, posts } = feedData;
        const channelInfo = { title, description };
        posts.forEach((post) => postsLinks.push(post.postLink));
        state.feed.channels = [channelInfo];
        state.feed.posts = [...posts].reverse();
      })
      .catch((error) => {
        if (error.response) {
          state.feed.errors = { err: error.response.status, errType: 'httpClient' };
        } else {
          state.feed.errors = { err: error.message, errType: 'httpClient' };
        }
      });
    state.form.inputProcessState = 'done';
    updateFeed(state);
  });

  updateFeed();

  render(state);
};
