import React, { Dispatch, SetStateAction } from 'react';

export type UseQueryParameterReturn = [string, Dispatch<SetStateAction<string>>];
export type Mode = 'simple' | 'required' | 'suppress';
export type UseQueryParameter = (
  name:string,
  defaultValue?:string,
  mode?:Mode
) => UseQueryParameterReturn;

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
  const previousParameterValueRef = React.useRef(defaultValue);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    const urlSearch = url.searchParams;

    // in required mode, if the name is not in the url, put it in there
    if (!urlSearch.has(name) && mode === 'required') {
      urlSearch.set(name, defaultValue);
      window.history.replaceState(null, '', url);
    }

    // if the url and the state disagree, take the url value
    const val = urlSearch.get(name);
    const normalizedVal = val === null ? '' : val;
    if (normalizedVal !== queryParameterValue) {
      // Preserve the state in the case that the stored value === the default value
      // the query value is null, and we are in 'suppress' mode
      // I.E. if the page is loading with nothing in the url, the default value stands
      if (mode === 'required' || queryParameterValue !== defaultValue || val != null) {
        setState(normalizedVal);
      }
    }

    // in suppress module if the value is ever default, remove it
    if (normalizedVal === defaultValue && mode === 'suppress' && val !== null) {
      urlSearch.delete(name);
      window.history.replaceState(null, '', url);
    }

    previousParameterValueRef.current = queryParameterValue;
  }, [name, queryParameterValue, previousParameterValueRef]);

  const setQueryParameter = React.useCallback((nextVal:SetStateAction<string>) => {
    // Handle the setState api
    let normalizedNextVal = '';

    // if the passed value is different, set the url, then the state to cause minimal re-renders

    // get the latest state from the URL
    const url = new URL(window.location.href);
    const urlSearch = url.searchParams;
    const val = urlSearch.get(name);
    const normalizedVal = val === null ? '' : val;

    if (typeof nextVal === 'function') {
      // if the state has mutated elsewhere on the page
      if (normalizedVal && normalizedVal !== previousParameterValueRef.current) {
        previousParameterValueRef.current = normalizedVal;
      }
      normalizedNextVal = nextVal(previousParameterValueRef.current);
    } else {
      normalizedNextVal = nextVal;
    }

    // update the url with the updated value
    if (normalizedNextVal !== val) {
      urlSearch.set(name, normalizedNextVal);
      window.history.replaceState(null, '', url);
      setState(normalizedNextVal);
    }

    return normalizedNextVal;
  }, [previousParameterValueRef, setState]);

  return [queryParameterValue, setQueryParameter];
};

export default useQueryParameter;
