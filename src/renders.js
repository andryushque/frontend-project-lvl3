import { watch } from 'melanke-watchjs';
import i18next from 'i18next';

export default (state) => {
  const { form } = state;
  const inputField = document.getElementById('inputField');
  const submitButton = document.querySelector('.btn');
  const errorMessage = document.getElementById('errorMessage');
  const channelsList = document.querySelector('.channelsList');
  const postsList = document.querySelector('.postsList');
  const postsCount = document.getElementById('postsCount');

  const renderChannelsList = (channels) => {
    channels.forEach((channel) => {
      const { title, description, channelId } = channel;
      if (!document.getElementById(channelId)) {
        const channelTitle = document.createElement('h5');
        channelTitle.innerText = title;
        const channelDescription = document.createElement('div');
        channelDescription.classList.add('text-secondary');
        channelDescription.innerText = description;
        const channelItem = document.createElement('div');
        const underline = document.createElement('hr');
        channelItem.classList.add('mb-4');
        channelItem.id = channelId;
        channelItem.append(channelTitle, channelDescription);
        channelsList.prepend(channelItem, underline);
      }
    });
  };

  const renderPostsList = (posts) => {
    posts.forEach((post) => {
      const { postTitle, postLink, postId } = post;
      if (!document.getElementById(postId)) {
        const postItemLink = document.createElement('a');
        const postItem = document.createElement('li');
        postItemLink.innerText = postTitle;
        postItemLink.href = postLink;
        postItem.classList.add('feedPost');
        postItem.id = postId;
        postItem.append(postItemLink);
        postsList.prepend(postItem);
      }
    });
  };

  const renderPostsCount = (count) => {
    postsCount.innerText = count;
    postsCount.classList.add('text-dark');
  };

  const removeErrorMessage = () => {
    if (document.querySelector('.errorMessage')) {
      document.querySelector('.errorMessage').remove();
    }
  };

  const renderErrorMessage = (errors) => {
    removeErrorMessage();
    const errorMessageContainer = document.createElement('div');
    errorMessageContainer.classList.add('errorMessage', 'container', 'd-block', 'mt-2');
    const { type, subType } = errors;
    const interval = 4000;
    if (errors.length === 0) return;
    if (type === 'httpClient') {
      switch (subType) {
        case 404: case 406: case 500:
          errorMessageContainer.innerText = i18next.t(`${type}.error${subType}`);
          break;
        case 'Network Error':
          errorMessageContainer.innerText = i18next.t(`${type}.networkError`);
          break;
        default:
          errorMessageContainer.innerText = i18next.t(`${type}.unknownError`);
      }
      errorMessageContainer.classList.add('alert-danger');
      errorMessage.append(errorMessageContainer);
      setTimeout(removeErrorMessage, interval);
    }
    if (type === 'input') {
      errorMessageContainer.innerText = i18next.t(`${type}.${subType}`);
      errorMessageContainer.classList.add('invalid-feedback');
      errorMessage.append(errorMessageContainer);
    }
  };

  watch(state, 'form', () => {
    if (form.processState === 'finished') {
      inputField.classList.remove('is-valid', 'is-invalid');
      inputField.value = '';
      inputField.disabled = false;
      submitButton.disabled = true;
    } else if (form.processState === 'sending') {
      inputField.disabled = true;
      submitButton.disabled = true;
    } else if (form.processState === 'ready') {
      inputField.classList.remove('is-valid', 'is-invalid');
      inputField.disabled = false;
      submitButton.disabled = true;
      removeErrorMessage();
    } else if (form.processState === 'filling') {
      inputField.disabled = false;
      submitButton.disabled = true;
      switch (form.validationState) {
        case true:
          inputField.classList.remove('is-invalid');
          inputField.classList.add('is-valid');
          submitButton.disabled = false;
          break;
        case false:
          inputField.classList.remove('is-valid');
          inputField.classList.add('is-invalid');
          break;
        default:
          throw new Error(`Unknown validation state: ${form.validationState}`);
      }
    } else {
      throw new Error(`Unknown state: ${form.processState}`);
    }
  });

  watch(state, 'errors', () => {
    renderErrorMessage(state.errors);
  });

  watch(state, 'channels', () => {
    renderChannelsList(state.channels);
  });

  watch(state, 'posts', () => {
    renderPostsList(state.posts);
    renderPostsCount(state.posts.length);
  });
};
