import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const refs = {
  form: document.querySelector('#search-form'),
  submitBtn: document.querySelector('[type="submit"]'),
  input: document.querySelector('[name="searchQuery"]'),
  gallery: document.querySelector('.gallery .container'),
  loadMoreBtn: document.querySelector('.load-more'),
  loadMoreBtnSpace: document.querySelector('.load-more-space'),
};

const PER_PAGE = 40;

refs.form.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

hideLoadBtn();

let searchQuery = '';
let pageNumber = 1;

function createMarkup(data) {
  return data
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
          <a href="${largeImageURL}" class="gallery-card-wrapper">      
          <div class="photo-card">
    <img src="${webformatURL}" alt="${tags}" loading="lazy" />
    <div class="info">
      <p class="info-item">
        Likes<b>${likes}</b>
      </p>
      <p class="info-item">
        Views<b>${views}</b>
      </p>
      <p class="info-item">
        Comments<b>${comments}</b>
      </p>
      <p class="info-item">
        Downloads<b>${downloads}</b>
      </p>
    </div>
  </div>
</a>`)
    .join('');
}

function clearMarkup() {
  refs.gallery.innerHTML = '';
  hideLoadBtn();
}

function hideLoadBtn() {
  refs.loadMoreBtnSpace.classList.add('visually-hidden');
}

function showLoadBtn() {
  refs.loadMoreBtnSpace.classList.remove('visually-hidden');
}

function fetchImages(query, page) {
  const BASE_URL = 'https://pixabay.com/api';
  const OPTIONS = `key=32897685-86f86f9a2add698f50e4fb3f9&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${PER_PAGE}&page=${page}`;

  return axios.get(`${BASE_URL}/?${OPTIONS}`);
}

async function onSearch(event) {
  event.preventDefault();
  clearMarkup();
  pageNumber = 1;
  searchQuery = refs.input.value;
  if (searchQuery) {
    try {
      const response = await fetchImages(searchQuery, pageNumber);
      if (response.data.hits.length === 0) {
        clearMarkup();
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        Notify.success(`Hooray! We found ${response.data.totalHits} images.`);

        refs.gallery.insertAdjacentHTML(
          'beforeend',
          createMarkup(response.data.hits)
        );
        lightbox.refresh();
        if (response.data.totalHits > PER_PAGE) {
          showLoadBtn();
        }
      }
    } catch (error) {
      Notify.failure(error);
      clearMarkup();
    }
  } else {
    Notify.warning('Please start typing.');
  }
}

async function onLoadMore() {
  pageNumber += 1;
  try {
    const response = await fetchImages(searchQuery, pageNumber);

    const totalPages = response.data.totalHits / PER_PAGE;
    if (totalPages <= pageNumber) {
      hideLoadBtn();
      Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
    refs.gallery.insertAdjacentHTML(
      'beforeend',
      createMarkup(response.data.hits)
    );
    lightbox.refresh();
  } catch (error) {
    Notify.failure(error);
    clearMarkup();
  }
}

const lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});