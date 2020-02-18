const domParser = new DOMParser();

const parse = (data) => {
  const parsedData = domParser.parseFromString(data, 'text/xml');
  const title = parsedData.querySelector('title').textContent;
  const description = parsedData.querySelector('description').textContent;

  const posts = [];
  const postItems = parsedData.querySelectorAll('item');
  postItems.forEach((postItem) => {
    const postTitle = postItem.querySelector('title').textContent;
    const postLink = postItem.querySelector('link').textContent;
    const post = { postTitle, postLink };
    posts.push(post);
  });

  return {
    title,
    description,
    posts,
  };
};

export default parse;
