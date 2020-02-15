import { watch } from 'melanke-watchjs';
import _ from 'lodash';

const inputField = document.getElementById('url');
const button = document.querySelector('.btn');
const message = document.getElementById('message');
const feedChannelsList = document.querySelector('.feedChannelsList');
const feedPostsList = document.querySelector('.feedPostsList');
const feedPostsCount = document.querySelector('.count');

const renderFeed = (title, description, posts) => {
  const feedTitle = document.createElement('h5');
  feedTitle.innerText = title;
  const feedDescription = document.createElement('div');
  feedDescription.classList.add('text-secondary');
  feedDescription.innerText = description;

  const feedList = document.createElement('div');
  const hr = document.createElement('hr');
  feedList.classList.add('mb-4');
  feedList.append(feedTitle, feedDescription);
  feedChannelsList.append(feedList, hr);

  const feedPosts = Object.values(posts);
  feedPosts.forEach((post) => {
    const { postTitle, postLink } = post;
    const postItem = document.createElement('li');
    const postItemLink = document.createElement('a');
    postItemLink.href = postLink;
    postItemLink.innerText = postTitle;
    postItem.id = _.uniqueId('post_');
    postItem.classList.add('feedPost');
    postItem.append(postItemLink);
    feedPostsList.append(postItem);
  });
};

const renderUpdatedFeed = (newPosts) => {
  newPosts.forEach((newPost) => {
    const { postTitle, postLink } = newPost;
    const newPostItem = document.createElement('li');
    const newPostItemLink = document.createElement('a');
    newPostItemLink.href = postLink;
    newPostItemLink.innerText = postTitle;
    newPostItem.id = _.uniqueId('post_');
    newPostItem.classList.add('feedPost');
    newPostItem.append(newPostItemLink);
    feedPostsList.prepend(newPostItem);
  });
};

const renderFeedPostsCount = (count) => {
  feedPostsCount.innerText = count;
};

const renderErrorMessage = (errorMessage, feedbackTypeClass) => {
  if (document.querySelector('.errorMessage')) {
    document.querySelector('.errorMessage').remove();
  }
  const errorMessageContainer = document.createElement('div');
  errorMessageContainer.classList.add('errorMessage', 'container', 'd-block', 'mt-2', feedbackTypeClass);
  errorMessageContainer.innerText = errorMessage;
  message.append(errorMessageContainer);
};

const render = (state) => {
  const { form, feed } = state;

  watch(state, 'form', () => {
    if (form.inputProcessState === 'done') {
      if (document.querySelector('.errorMessage')) {
        document.querySelector('.errorMessage').remove();
      }
      inputField.classList.remove('is-valid', 'is-invalid');
      inputField.value = '';
      button.disabled = true;
    } else {
      switch (form.validationState) {
        case 'valid':
          inputField.classList.remove('is-invalid');
          inputField.classList.add('is-valid');
          button.disabled = false;
          break;
        case 'invalid':
          inputField.classList.remove('is-valid');
          inputField.classList.add('is-invalid');
          button.disabled = true;
          break;
        default:
          inputField.classList.remove('is-valid', 'is-invalid');
          button.disabled = true;
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
    const currentFeedTitle = feed.currentPosts.feedInfo.feedTitle;
    const currentFeedDescription = feed.currentPosts.feedInfo.feedDescription;
    const currentFeedPosts = feed.currentPosts.feedPosts;
    renderFeed(currentFeedTitle, currentFeedDescription, currentFeedPosts);
  });

  watch(feed, 'newPosts', () => {
    renderUpdatedFeed(feed.newPosts);
  });

  watch(feed, 'allPostsCount', () => {
    renderFeedPostsCount(feed.allPostsCount);
  });
};

export default render;
