export const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_LOADING_LIST: 'SET_LOADING_LIST',
  SET_ERROR: 'SET_ERROR',
  ADD_REPO_LIST: 'ADD_REPO_LIST',
  SET_HAS_MORE_REPO: 'SET_HAS_MORE_REPO',
  NEW_SORTBY: 'NEW_SORTBY',
  NEW_USER: 'NEW_USER',
  ADD_REPOS: 'ADD_REPOS',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

export const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      }
    case ACTIONS.SET_LOADING_LIST:
      return {
        ...state,
        loadingList: action.payload,
      }
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload
      }
    case ACTIONS.ADD_REPO_LIST:
      return {
        ...state,
        repo_list: [...state.repo_list, ...action.payload],
        page: state.page + 1
      }
    case ACTIONS.SET_HAS_MORE_REPO:
      return {
        ...state,
        has_more_repo: action.payload,
      }
    case ACTIONS.NEW_SORTBY:
      return {
        ...state,
        sort_by: action.payload.sort_by,
        repo_list: action.payload.repo_list,
        page: 1
      }
    case ACTIONS.NEW_USER:
      return {
        ...state,
        ...action.payload,
      }
    case ACTIONS.ADD_REPOS:
      if (action.payload.content.length > 0) {
        const files = [];
        const dirs = [];
        action.payload.content.forEach(item => {
          if (item.type === "dir") dirs.push(item);
          else files.push(item);
        })
        return {
          ...state,
          repos: [...state.repos, { ...action.payload, content: [...dirs, ...files] }],
        }
      } else {
        return {
          ...state,
          repos: [...state.repos, action.payload],
        }
      }
    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}