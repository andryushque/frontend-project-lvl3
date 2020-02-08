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

export { createUrlFeedList, createPostsList };
