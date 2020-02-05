import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { watch } from 'melanke-watchjs';
import * as yup from 'yup';
import axios from 'axios';

export default () => {
  const domParser = new DOMParser();

  // const body = document.querySelector('body');
  const inputForm = document.getElementById('url');
  const button = document.querySelector('.btn');

  const state = {
    form: {
      inputProcessState: 'inProcess',
      validationState: true,
      inputedUrl: '',
      // submitDisabled: false
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

  const createUrlFeedList = (title, description = 'no description') => {
    const li = document.createElement('li');
    li.classList.add('feedListItem');

    const urlTitle = document.createElement('h4');
    urlTitle.innerText = title;

    const urlDescription = document.createElement('p');
    urlDescription.innerText = description;

    li.append(urlTitle, urlDescription);
    document.querySelector('.feedList').append(li);
  };

  const createPostsList = (itemsColl) => {
    const items = Object.values(itemsColl);
    console.log(items);

    items.forEach((item) => {
      const li = document.createElement('li');
      li.classList.add('postItem');

      const urlLink = document.createElement('a');
      urlLink.href = item.querySelector('link').textContent;
      urlLink.innerText = item.querySelector('title').textContent;

      li.append(urlLink);
      document.querySelector('.postsList').append(li);
    });
  };

  // DOMParser => https://developer.mozilla.org/ru/docs/Web/API/DOMParser
  // proxy => https://github.com/Rob--W/cors-anywhere/#documentation
  // axios GET request => https://github.com/axios/axios
  const getParsedXml = (url) => {
    axios.get(`https://cors-anywhere.herokuapp.com/${url}`)
      .then((response) => domParser.parseFromString(response.data, 'application/xml'))
      .then((parsed) => {
        const title = parsed.querySelector('title').textContent;
        const description = parsed.querySelector('description').textContent;
        const items = parsed.querySelectorAll('item');
        createUrlFeedList(title, description);
        createPostsList(items);
      })
      .catch(console.log);
  };

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
    state.urlList.push(state.form.inputedUrl);
    console.log(state.urlList);

    getParsedXml(state.form.inputedUrl);
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
