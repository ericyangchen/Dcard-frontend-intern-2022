import { createContext, useContext, useReducer, useCallback, useState } from 'react';
import { reducer, ACTIONS } from './RepoReducer';
import { getUser, getRepoList, getRepoDetail, getRepoDetailContent } from '../api/repo';

const RepoContext = createContext();

export const useRepo = () => useContext(RepoContext);

export const RepoProvider = ({ children }) => {
  const initialState = {
    loading: false,
    loadingList: false,
    user: null,
    repo_list: null,
    sort_by: "name",
    page: 1,
    has_more_repo: false,
    repos: [],
    error: null,
  }
  // reducer
  const [state, dispatch] = useReducer(reducer, initialState);

  // set loading status (don't show anything)
  const toggleLoading = useCallback((status) => {
    dispatch({
      type: ACTIONS.SET_LOADING,
      payload: status,
    })
  }, []);
  // set loading spinner for list (show spinner)
  const toggleLoadingList = (status) => {
    dispatch({
      type: ACTIONS.SET_LOADING_LIST,
      payload: status,
    })
  }
  // clear error
  const clearError = useCallback(() => {
    dispatch({
      type: ACTIONS.CLEAR_ERROR,
    })
  }, []);

  // load more repo_list
  const [loadMore, setLoadMore] = useState(false);
  const loadMoreList = useCallback(() => {
    setLoadMore(true);
  }, []);

  // functions
  const fetchRepoList = useCallback(async (username, sortBy) => {
    const handleError = (error) => {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: error
      })
    }
    // check state.user.login === username
    if (state.user && (username).toLowerCase() === (state.user.login).toLowerCase()) {
      // state.sort_by === sortBy
      if (sortBy === state.sort_by) {
        if (loadMore) {
          console.log("new page");
          toggleLoadingList(true);
          setLoadMore(false);
          try {
            const res = await getRepoList(state.user.login, state.sort_by, state.page + 1);
            // api call success
            if (res.status === 200) {
              // add to repo_list, also state.page + 1
              dispatch({
                type: ACTIONS.ADD_REPO_LIST,
                payload: res.data
              })
              // check has more repo (to load)
              const hasMoreRepo = res.data.length >= 10 ? true : false;
              dispatch({
                type: ACTIONS.SET_HAS_MORE_REPO,
                payload: hasMoreRepo
              })
            } else {
              handleError({'new_page': res.status})
            }
          } catch (error) {
            handleError({'new_page': error.response.status})
          }

          toggleLoadingList(false);
        }
      }
      else {
        console.log("new sortby")
        toggleLoading(true);
        try {
          const res = await getRepoList(username, sortBy, 1);
          // api call success
          if (res.status === 200) {
            dispatch({
              type: ACTIONS.NEW_SORTBY,
              payload: {
                sort_by: sortBy,
                repo_list: res.data
              }
            })
            // check has more repo (to load)
            const hasMoreRepo = res.data.length >= 10 ? true : false;
            dispatch({
              type: ACTIONS.SET_HAS_MORE_REPO,
              payload: hasMoreRepo
            })
          } else {
            handleError({ 'new_sortby': res.status })
          }
        } catch (error) {
          console.log("new_sortby: ", error)
          handleError({ 'new_sortby': error.response.status })
        }
        toggleLoading(false);
      }
    }
    else {
      console.log("new user")
      // await both api calls to finish loading
      toggleLoading(true);
      try {
        const [resUser, resRepo] = await Promise.all([
          getUser(username),
          getRepoList(username, "name", 1)
        ]);
        // api call success
        if (resUser.status === 200 && resRepo.status === 200) {
          const hasMoreRepo = resRepo.data.length === 10 ? true : false;
          dispatch({
            type: ACTIONS.NEW_USER,
            payload: {
              'user': resUser.data,
              'repo_list': resRepo.data,
              'sort_by': "name",
              'page': 1,
              'has_more_repo': hasMoreRepo,
              'repos': [],
              'error': null
            }
          })
        } else {
          handleError({ 'new_user_user': resUser.status, 'new_user_repo': resRepo.status })
        }
      } catch (error) {
        handleError({ new_user: error.response.status })
      }
      toggleLoading(false);
    }
  }, [loadMore, state.page, state.sort_by, state.user, toggleLoading])

  const fetchRepoDetail = useCallback(async (username, repo) => {
    toggleLoading(true);
    // await both api calls
    try {
      const [resDetail, resContent] = await Promise.all([
        getRepoDetail(username, repo),
        getRepoDetailContent(username, repo)
      ])
      if (resDetail.status === 200 && resContent.status === 200) {
        dispatch({
          type: ACTIONS.ADD_REPOS,
          payload: { ...resDetail.data, content: resContent.data }
        })
      } else {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: { "add-repos": resDetail.status, "add-repos-content": resContent.status }
        })
      }
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: { "add-repos": error.response.status }
      })
    }
    toggleLoading(false);
  }, [toggleLoading]);


  const value = {
    loading: state.loading,
    loadingList: state.loadingList,
    user: state.user,
    repo_list: state.repo_list,
    sort_by: state.sort_by,
    page: state.page,
    has_more_repo: state.has_more_repo,
    repos: state.repos,
    error: state.error,
    fetchRepoList,
    fetchRepoDetail,
    loadMoreList,
    toggleLoading,
    clearError
  }
  return (
    <RepoContext.Provider value={value}>
      {children}
    </RepoContext.Provider>
  );
}