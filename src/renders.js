import { watch } from 'melanke-watchjs';

const body = document.querySelector('body');
const inputForm = document.getElementById('url');
const button = document.querySelector('.btn');
const message = document.getElementById('message');

const createFeed = (title, description, itemsColl) => {
  const divFeed = document.createElement('div');
  divFeed.classList.add('container', 'd-flex', 'mb-4');

  const divFeedInfo = document.createElement('div');
  divFeedInfo.classList.add('col-3');

  const divFeedPost = document.createElement('div');
  divFeedPost.classList.add('col-9');

  const feedTitle = document.createElement('h4');
  feedTitle.innerText = title;

  const feedDescription = document.createElement('p');
  feedDescription.innerText = description;

  divFeedInfo.append(feedTitle, feedDescription);

  const items = Object.values(itemsColl);
  // items.length = 5; // => limit?
  items.forEach((item) => {
    const { postTitle, postLink } = item;
    const li = document.createElement('li');
    const urlLink = document.createElement('a');
    urlLink.href = postLink;
    urlLink.innerText = postTitle;

    li.append(urlLink);
    divFeedPost.append(li);
  });

  divFeed.append(divFeedInfo, divFeedPost);
  body.append(divFeed);
};


const createErrorMessage = (errorMessage, feedbackTypeClass) => {
  if (document.querySelector('.errorMessage')) {
    document.querySelector('.errorMessage').remove();
  }
  const divErrorMessage = document.createElement('div');
  divErrorMessage.classList.add('errorMessage', 'container', 'd-block', 'mt-2', feedbackTypeClass);
  divErrorMessage.innerText = errorMessage;
  message.append(divErrorMessage);
};


const render = (state) => {
  const { form, feed } = state;

  watch(form, 'validationState', () => {
    if (form.validationState) {
      button.disabled = !form.validationState; // => false
      inputForm.classList.remove('is-invalid');
      inputForm.classList.add('is-valid');
    } else {
      button.disabled = !form.validationState; // => true
      inputForm.classList.remove('is-valid');
      inputForm.classList.add('is-invalid');
    }
  });

  watch(form, 'inputProcessState', () => {
    if (form.inputProcessState === 'done') {
      inputForm.classList.remove('is-valid');
      inputForm.classList.remove('is-invalid');
      inputForm.value = '';
      button.disabled = true;
      if (document.querySelector('.errorMessage')) {
        document.querySelector('.errorMessage').remove();
      }
    }
  });

  watch(state, 'validateResultMessage', () => {
    createErrorMessage(state.validateResultMessage, 'invalid-feedback');
  });

  watch(state, 'errorMessage', () => {
    createErrorMessage(state.errorMessage, 'alert-danger');
  });

  watch(feed, 'currentPosts', () => {
    const currentTitle = feed.currentPosts.title;
    const currentDescription = feed.currentPosts.description;
    const currentFeedPosts = feed.currentPosts.feedPosts;
    createFeed(currentTitle, currentDescription, currentFeedPosts);
  });
};

export default render;
