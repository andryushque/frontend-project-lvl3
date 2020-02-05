import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { watch } from 'melanke-watchjs';
import * as yup from 'yup';
// import axios from 'axios';

export default () => {
  // const domParser = new DOMParser();

  // const body = document.querySelector('body');
  const inputForm = document.getElementById('url');
  const button = document.querySelector('.btn');

  const checkoutFeedUrlSchema = yup
    .string()
    .url('Please enter a valid URL address.')
    .required('This field is required.');

  const isUrlValid = (url) => checkoutFeedUrlSchema.isValid(url).then((valid) => valid);

  const createUrlFeedList = (url) => {
    const li = document.createElement('li');
    li.classList.add('feedListItem');
    li.append(url);
    document.querySelector('.feedList').append(li);
  };

  const state = {
    form: {
      inputProcessState: 'inProcess',
      validationState: true,
      // submitDisabled: false
    },

    urlList: [],
  };

  inputForm.addEventListener('input', (e) => {
    // происходит валидация в процессе ввода
    // => меняется состояние validationState
    // => меняется состояние inputProcessState
    const url = e.target.value;
    isUrlValid(url).then((valid) => {
      if (valid) { // && state.urlList.includes(url)
        state.form.validationState = true;
      } else {
        state.form.validationState = false;
      }
    });

    state.form.inputProcessState = 'inProcess';
  });

  button.addEventListener('click', () => {
    // происходит добавление адреса в список (пока что просто как пример)
    // => меняется состояние inputProcessState
    const url = inputForm.value;
    console.log(url);
    createUrlFeedList(url);

    state.form.inputProcessState = 'done';
  });

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
