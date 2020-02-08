const domParser = new DOMParser();

const parse = (data) => {
  const parsedData = domParser.parseFromString(data, 'text/xml');
  const title = parsedData.querySelector('title').textContent;
  const description = parsedData.querySelector('description').textContent;
  const items = parsedData.querySelectorAll('item');

  return {
    title,
    description,
    items,
  };
};

export default parse;
