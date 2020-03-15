import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import render from './renders';
import parse from './parser';
import validate from './validator';
import resources from './locales';

export default () => {
  const state = {
    form: {
      processState: 'filling', // => filling | sending | finished | ready
      validationState: true, // => true | false
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
    const errors = validate(state.form.url, state.urls);
    state.errors = errors;
    state.form.validationState = _.isEqual(errors, {});
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
    if (state.form.url === '') {
      state.form.processState = 'ready';
      return;
    }
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
          state.errors = { type: 'httpClient', subType: error.response.status };
        } else {
          state.errors = { type: 'httpClient', subType: error.message };
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
