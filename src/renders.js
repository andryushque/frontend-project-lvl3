import { watch } from 'melanke-watchjs';
import _ from 'lodash';

// const body = document.querySelector('body');
const inputForm = document.getElementById('url');
const button = document.querySelector('.btn');
const message = document.getElementById('message');
const ulFeedList = document.querySelector('.feedList');
const divFeedPosts = document.querySelector('.feedPosts');

const renderFeed = (title, description, itemsColl) => {
  const feedTitle = document.createElement('h5');
  feedTitle.innerText = title;
  const feedDescription = document.createElement('h6');
  feedDescription.innerText = description;

  const feedList = document.createElement('li');
  const hr = document.createElement('hr');
  feedList.classList.add('mb-4');
  feedList.append(feedTitle, feedDescription);
  ulFeedList.append(feedList, hr);

  const items = Object.values(itemsColl);
  items.forEach((item) => {
    const { postTitle, postLink } = item;
    const li = document.createElement('li');
    const urlLink = document.createElement('a');
    urlLink.href = postLink;
    urlLink.innerText = postTitle;
    li.id = _.uniqueId('post_');
    li.classList.add('feedPost');

    li.append(urlLink);
    divFeedPosts.append(li);
  });
};

const renderUpdatedFeed = (newPosts) => { // state.feed.newPosts
  newPosts.forEach((item) => {
    const { postTitle, postLink } = item;
    const li = document.createElement('li');
    const urlLink = document.createElement('a');
    urlLink.href = postLink;
    urlLink.innerText = postTitle;
    li.id = _.uniqueId('newPost_');

    li.append(urlLink);
    divFeedPosts.prepend(li);
  });
};

const renderErrorMessage = (errorMessage, feedbackTypeClass) => {
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
    button.disabled = !form.validationState;
    if (form.validationState) {
      inputForm.classList.remove('is-invalid');
      inputForm.classList.add('is-valid');
    } else {
      inputForm.classList.remove('is-valid');
      inputForm.classList.add('is-invalid');
    }
  });

  watch(form, 'inputProcessState', () => {
    if (form.inputProcessState === 'done') {
      inputForm.classList.remove('is-valid', 'is-invalid');
      inputForm.value = '';
      button.disabled = true;
      if (document.querySelector('.errorMessage')) {
        document.querySelector('.errorMessage').remove();
      }
    }
  });

  watch(state, 'validateResultMessage', () => {
    renderErrorMessage(state.validateResultMessage, 'invalid-feedback');
  });

  watch(state, 'errorMessage', () => {
    renderErrorMessage(state.errorMessage, 'alert-danger');
  });

  watch(feed, 'currentPosts', () => {
    const currentTitle = feed.currentPosts.feedInfo.feedTitle;
    const currentDescription = feed.currentPosts.feedInfo.feedDescription;
    const currentFeedPosts = feed.currentPosts.feedPosts;
    renderFeed(currentTitle, currentDescription, currentFeedPosts);
  });

  watch(feed, 'newPosts', () => {
    renderUpdatedFeed(feed.newPosts);
  });
};

export default render;
