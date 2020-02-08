const body = document.querySelector('body');

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

export default createFeed;
