import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import axios from 'axios';
import render from './renders';
import parse from './parser';

const state = {
  form: {
    inputProcessState: 'inProcess',
    validationState: true,
    inputedUrl: '',
  },
  feed: {
    currentPosts: [],
  },
  urlList: [],
  validateResultMessage: '',
};

export default () => {
  const inputForm = document.getElementById('url');
  const button = document.querySelector('.btn');

  const checkoutFeedUrlSchema = yup
    .string()
    .url('Please enter a valid URL address.')
    .required('This field is required.');

  const isUrlValid = (url) => checkoutFeedUrlSchema.isValid(url).then((valid) => valid);
  const isUrlDuplicated = (url) => state.urlList.includes(url);

  inputForm.addEventListener('input', (e) => {
    state.form.inputedUrl = e.target.value;

    isUrlValid(state.form.inputedUrl).then((valid) => {
      if (valid && state.form.inputedUrl && !isUrlDuplicated(state.form.inputedUrl)) {
        state.form.validationState = true;
        state.validateResultMessage = '';
      } else if (valid && isUrlDuplicated(state.form.inputedUrl)) {
        state.form.validationState = false;
        state.validateResultMessage = 'This URL is already added';
      } else {
        state.form.validationState = false;
        state.validateResultMessage = 'This URL is invalid';
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
        const feedData = parse(response.data);
        state.feed.currentPosts = feedData;
      })
      .catch(console.log);

    state.form.inputProcessState = 'done';
  });

  render(state);
};
