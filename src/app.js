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
  errorMessage: '',
};

const errorMessages = {
  requestError: '404: The requested URL was not found on this server. Please try again.',
  serverError: '500: Internal Server Error. Please try again.',
  networkError: 'Network problem. Please check your internet connection and try again.',
  unknownError: 'Unknown Error. Please try again.',
};

export default () => {
  const inputForm = document.getElementById('url');
  const button = document.querySelector('.btn');

  const checkoutFeedUrlSchema = yup
    .string()
    .url()
    .required();

  const isUrlValid = (url) => checkoutFeedUrlSchema.isValid(url).then((valid) => valid);
  const isUrlDuplicated = (url) => state.urlList.includes(url);

  inputForm.addEventListener('input', (e) => {
    state.form.inputedUrl = e.target.value;
    state.errorMessage = '';
    isUrlValid(state.form.inputedUrl).then((valid) => {
      if (valid && !isUrlDuplicated(state.form.inputedUrl)) {
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
      .then()
      .catch((err) => {
        if (err.message === 'Network Error') {
          state.errorMessage = errorMessages.networkError;
        } else if (err.response) {
          const errorStatus = err.response.status;
          switch (errorStatus) { // => add later: 406
            case 404:
              state.errorMessage = errorMessages.requestError;
              break;
            case 500:
              state.errorMessage = errorMessages.serverError;
              break;
            default:
              state.errorMessage = errorMessages.unknownError;
          }
        } else {
          state.errorMessage = errorMessages.unknownError;
        }
      });
    state.form.inputProcessState = 'done';
  });

  render(state);
};
