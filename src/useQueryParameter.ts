import React, { Dispatch, SetStateAction } from 'react';

type UseQueryParameter = (
  name:string,
  defaultValue?:string,
  mode?:'simple' | 'required' | 'suppress'
) => [string, Dispatch<SetStateAction<string>>];

/**
 * useQueryParameter acts like useState, but keeps the url in sync.
 * This allows for bookmarking, refreshing, and link sharing in your React apps
 * @param {string} name - the name of the param in the url to sync with
 * @param {string} [defaultValue=''] - the default value to be used if the url has no such param
 * @param {'simple' | 'required' | 'suppress'} [mode='suppress'] - the mode of the sync: In
 *   'suppress' mode, the query parameter will be removed from the url if the state value ever
 *   === the passed `defaultValue` In 'required' mode, the query parameter will be added if it is
 *   not present at any time In 'simple' mode, the query parameter will neither be added nor
 *   removed unless its value changes 'suppress' is the default as this keeps your URL clean while
 *   using `useQueryParameter` for large forms
 * @return {string, Dispatch<SetStateAction<string>>} = the returned values adhere to the
 *   React.setState api
 */
const useQueryParameter : UseQueryParameter = (name, defaultValue = '', mode = 'suppress') => {
  const [queryParameterValue, setState] = React.useState(defaultValue);
  const previousParameterValueRef = React.useRef('');

  React.useEffect(() => {
    const url = new URL(window.location.href);
    const urlSearch = url.searchParams;

    // in required mode, if the name is not in the url, put it in there
    if (!urlSearch.has(name) && mode === 'required') {
      urlSearch.set(name, defaultValue);
      // eslint-disable-next-line no-restricted-globals -- this is the intention of the library
      history.replaceState(null, '', url);
    }

    // if the url and the state disagree, take the url value
    const val = urlSearch.get(name);
    const normalizedVal = val === null ? '' : val;
    if (normalizedVal !== queryParameterValue) {
      // Preserve the state in the case that the stored value === the default value
      // the query value is null, and we are in 'suppress' mode
      // I.E. if the page is loading with nothing in the url, the default value stands
      if (mode !== 'suppress' || queryParameterValue !== defaultValue || val != null) {
        setState(normalizedVal);
      }
    }

    // in suppress module if the value is ever default, remove it
    if (normalizedVal === defaultValue && mode === 'suppress') {
      urlSearch.delete(name);
      // eslint-disable-next-line no-restricted-globals -- this is the intention of the library
      history.replaceState(null, '', url);
    }

    previousParameterValueRef.current = queryParameterValue;
  }, [name, queryParameterValue]);

  const setQueryParameter = React.useCallback((nextVal:SetStateAction<string>) => {
    // Handle the setState api
    let normalizedNextVal = '';
    if (typeof nextVal === 'function') {
      normalizedNextVal = nextVal(previousParameterValueRef.current);
    } else {
      normalizedNextVal = nextVal;
    }

    // if the passed value is different, set the url, then the state to cause minimal re-renders
    const url = new URL(window.location.href);
    const urlSearch = url.searchParams;
    const val = urlSearch.get(name);
    if (normalizedNextVal !== val) {
      urlSearch.set(name, normalizedNextVal);
      // eslint-disable-next-line no-restricted-globals -- this is the intention of the library
      history.replaceState(null, '', url);
      setState(normalizedNextVal);
    }

    return normalizedNextVal;
  }, [previousParameterValueRef, setState]);

  return [queryParameterValue, setQueryParameter];
};

export default useQueryParameter;
