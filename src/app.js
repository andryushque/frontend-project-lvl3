import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { watch } from 'melanke-watchjs';
import * as yup from 'yup';
import axios from 'axios';
import createFeed from './renders';
import parse from './parser';

export default () => {
  const inputForm = document.getElementById('url');
  const button = document.querySelector('.btn');

  const state = {
    form: {
      inputProcessState: 'inProcess',
      validationState: true,
      inputedUrl: '',
    },

    urlList: [],
  };

  // validation functions
  const checkoutFeedUrlSchema = yup
    .string()
    .url('Please enter a valid URL address.')
    .required('This field is required.');

  const isUrlValid = (url) => checkoutFeedUrlSchema.isValid(url).then((valid) => valid);
  const isUrlDuplicated = (url) => state.urlList.includes(url);

  // events
  inputForm.addEventListener('input', (e) => {
    state.form.inputedUrl = e.target.value;
    isUrlValid(state.form.inputedUrl).then((valid) => {
      if (valid) {
        state.form.validationState = !isUrlDuplicated(state.form.inputedUrl);
      } else {
        state.form.validationState = false;
      }
    });
    state.form.inputProcessState = 'inProcess';
  });

  button.addEventListener('click', () => {
    const url = state.form.inputedUrl;
    state.urlList.push(url);
    const proxy = 'cors-anywhere.herokuapp.com';
    const link = `https://${proxy}/${url}`;

    axios.get(link)
      .then((response) => {
        const feed = parse(response.data);
        console.log(feed.title);
        createFeed(feed.title, feed.description, feed.feedPosts);
      })
      .catch(console.log);

    state.form.inputProcessState = 'done';
  });

  // watchers
  watch(state.form, 'validationState', () => {
    if (state.form.validationState) {
      button.disabled = !state.form.validationState; // => false
      inputForm.classList.remove('is-invalid');
      inputForm.classList.add('is-valid');
    } else {
      button.disabled = !state.form.validationState; // => true
      inputForm.classList.remove('is-valid');
      inputForm.classList.add('is-invalid');
    }
  });

  watch(state.form, 'inputProcessState', () => {
    if (state.form.inputProcessState === 'done') {
      inputForm.classList.remove('is-valid');
      inputForm.value = '';
      button.disabled = true;
    }
  });
};
