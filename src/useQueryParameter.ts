import * as url from "url";

type mode = 'simple' | 'required' | 'suppress';
import React from 'react';

export const useQueryParameterThing = (name:string, defaultVal:any = undefined, mode:mode = 'suppress'): [any, (nextVal:any) => void] => {
    const [state, setState] = React.useState(defaultVal)

    React.useEffect(()=> {
        const url = new URL(window.location.href)
        const urlSearch = url.searchParams

        // in required mode, if the name is not in the url, put it in there
        if (!urlSearch.has(name) && mode === 'required'){
            urlSearch.set(name, defaultVal)
            history.replaceState(null, '', url)
        }

        const val = urlSearch.get(name)
        if (val !== state) {
            setState(val)
        }

        // in suppress module if the value is ever default, or undefined, remove it
        if ((val === defaultVal || val === undefined) && mode === 'suppress') {
            urlSearch.delete(name)
            history.replaceState(null, '', url)
        }
    }, [name, state])

    const setQueryParameter = React.useCallback((nextVal:any) => {
        const url = new URL(window.location.href)
        const urlSearch = url.searchParams
        const val = urlSearch.get(name)
        if(nextVal !== val) {
            urlSearch.set(name, nextVal)
            history.replaceState(null, '', url)
            setState(nextVal)
        }
    }, [setState])

    return [state, setQueryParameter]
}

export default useQueryParameterThing
