![mr-hooks.png](https://raw.githubusercontent.com/mr-hooks/.github/main/mr-hooks.png)

# useQueryParameter

useQueryParameter acts like useState, but keeps the relevant query parameter in the url up to date.

This allows for bookmarking, refreshing, and link sharing in your React apps.

## Usage

### Example

```typescript jsx
import useQueryParameter from "@mr-hooks/use-query-parameter";

type OnSearch = (formValues : {searchString: string, sortDirection:string}) => void

const MySearchForm = (onSearch: OnSearch) => {
  // declare that we want two url parameters
  // 'searchString' will default to ''
  const [searchString, setSearchString] = useQueryParameter('search');
  // 'sortDirection' will default to 'descending'
  const [sortDirection, setSort] = useQueryParameter('sort', 'descending');

  // use these values and setters as you would with `useState`
  return <>
    <input
      type="search"
      value={searchString}
      onChange={e => setSearchString(e.target.value)}
    />
    <select
      value={sortDirection}
      onChange={e => setSort(e.target.value)}
    >
      <option value='descending'>Descending</option>
      <option value='ascending'>Ascending</option>
    </select>
    <button type="button" onClick={() => onSearch({searchString, sortDirection})}>Search</button>
  </>
}

export default MySearchForm;
```

With the above form, when `searchString` or `sortDirection` do not equal their default value, they will appear in the url of the page.

For example, if the user searches for `Ian M Banks`, then chooses `Ascending` the query parameters on your page will be `?search=Ian+M+Banks&sort=ascending`

By default, the hook is in `suppress` mode, which means it removed the query parameter if it can. Therefore, if the user now selects Descending again, the query parameters will now be `?search=Ian+M+Banks`. This keeps your query string as short as it can be.

### API

```typescript jsx
type UseQueryParameter = (
  name:string,
  defaultValue?:string,
  mode?:'simple' | 'required' | 'suppress'
) => [string, Dispatch<SetStateAction<string>>];
```

#### param: name {string} 
This is the name that should appear in the url for this query parameter.

Note: This value will be placed directly in the url query parameters, it is up to you make sure will not break your url. If in doubt stick to `/[a-zA-Z]/`.

#### param: [defaultValue=''] {string} 
This is the value to be used if the param is not in the url at all.

It is also the value checked by 'suppress' mode to remove the query parameter from the url. (More on `mode` below)

#### param: [mode='suppress'] {'simple' | 'required' | 'suppress'} 
The mode param encapsulates some of the more complex behavious you might want:

##### mode='suppress'
In suppress mode, if the value of the param is ever equal to the default value, the query parameter will be removed from the url.

This keeps the urls as simple as possible whenever the user sets a field back to its default value.

This is the default behaviour because it prevents redundant information from ending up in the url.

##### mode='required'
In required mode, the url parameter will be kept in the URL at all times, regardless of value.

This is good when you intend to use the query string with other systems, such as submitting it to a server that expects certain values to always be present regardless of value

The drawback is that for larger forms, even if most fields are on their default value, the query string will be very large.

##### mode='simple'
In simple mode, the url parameter will never be removed from the url, and will only be added to the url when the user first selects a value.

This mode can 'leave behind' lots of query strings in your url, therefore, despite it being the simplest mode, it's not recommended.

#### return: {[string, React.Dispatch<React.SetStateAction<string>>]}
The return type might look a little complex, but its really just the same return value as `React.useState`

Check out the [React Docs on useState](https://react.dev/reference/react/useState) for more information.
