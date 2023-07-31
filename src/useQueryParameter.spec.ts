import { renderHook, act } from '@testing-library/react';
import useQueryParameter, { UseQueryParameterReturn } from './useQueryParameter';

type Result = {
  current: UseQueryParameterReturn
};

type HistoryReplaceState = ((
  data: any,
  unused: string,
  url?: string | URL | null | undefined
) => void);
const getValue = (result: Result) => result.current[0];
const getSetValue = (result: Result) => result.current[1];

describe('useQueryParameter', () => {
  let previousLocation : Location;
  let previousHistoryReplaceState : HistoryReplaceState;
  beforeEach(() => {
    previousLocation = window.location;
    previousHistoryReplaceState = window.history.replaceState;
    // @ts-ignore
    delete window.location;
    window.location = new URL('http://localhost/?mockExistingParam=mockExistingValue') as unknown as Location;
    // @ts-ignore
    delete window.history.replaceState;
    window.history.replaceState = (data: any, unused: string, url?: string | URL | null) => {
      if (url !== null && url !== undefined) {
        window.location = new URL(url) as unknown as Location;
      }
    };
  });
  afterEach(() => {
    window.location = previousLocation;
    window.window.history.replaceState = previousHistoryReplaceState;
  });
  describe('mode="suppress" (default)', () => {
    it('should return empty string, and not modify the url', () => {
      const { result } = renderHook(() => useQueryParameter('mockKey'));

      expect(getValue(result)).toBe('');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');
    });
    it('should set the param in the url and now return it if the setter is called', () => {
      const { result } = renderHook(() => useQueryParameter('mockKey'));

      expect(getValue(result)).toBe('');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');

      act(() => {
        getSetValue(result)('mockValue');
      });

      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=mockValue');
      expect(getValue(result)).toBe('mockValue');
    });
    it('should set the param in the url and now return it if the setter is passed an updater function', () => {
      const { result } = renderHook(() => useQueryParameter('mockKey', 'defaultValueMock'));

      expect(getValue(result)).toBe('defaultValueMock');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');

      act(() => {
        getSetValue(result)((prevValue) => `nextMockValue-${prevValue}`);
      });

      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=nextMockValue-defaultValueMock');
      expect(getValue(result)).toBe('nextMockValue-defaultValueMock');

      act(() => {
        getSetValue(result)((prevValue) => `nextMockValue-${prevValue}`);
      });

      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=nextMockValue-nextMockValue-defaultValueMock');
      expect(getValue(result)).toBe('nextMockValue-nextMockValue-defaultValueMock');
    });
    it('should remove the param if the value is returned to the default value', () => {
      const { result } = renderHook(() => useQueryParameter('mockKey'));

      expect(getValue(result)).toBe('');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');

      act(() => {
        getSetValue(result)('mockValue');
      });

      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=mockValue');
      expect(getValue(result)).toBe('mockValue');

      act(() => {
        getSetValue(result)('');
      });

      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');
      expect(getValue(result)).toBe('');
    });
    it('should remove the param if the value is returned to the default value if the default value is provided', () => {
      const { result } = renderHook(() => useQueryParameter('mockKey', 'defaultValueMock'));

      expect(getValue(result)).toBe('defaultValueMock');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');

      act(() => {
        getSetValue(result)('mockValue');
      });

      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=mockValue');
      expect(getValue(result)).toBe('mockValue');

      act(() => {
        getSetValue(result)('defaultValueMock');
      });

      expect(getValue(result)).toBe('defaultValueMock');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');
    });
    it('should inherit the value from the url if it exists when the hook mounts', () => {
      const { result } = renderHook(() => useQueryParameter('mockExistingParam'));

      expect(getValue(result)).toBe('mockExistingValue');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');
    });
    it('should still remove the key from the url if the value becomes the default', () => {
      const { result } = renderHook(() => useQueryParameter('mockExistingParam', 'defaultValueMock'));

      expect(getValue(result)).toBe('mockExistingValue');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');

      act(() => {
        getSetValue(result)('defaultValueMock');
      });

      expect(getValue(result)).toBe('defaultValueMock');
      expect(window.location.search).toBe('');
    });
  });
  describe('mode="required"', () => {
    it('should return empty string, and add the key to the url', () => {
      const { result } = renderHook(() => useQueryParameter('mockKey', '', 'required'));

      expect(getValue(result)).toBe('');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=');
    });
    it('should set the param in the url and return it if the setter is called', () => {
      const { result } = renderHook(() => useQueryParameter('mockKey', '', 'required'));

      expect(getValue(result)).toBe('');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=');

      act(() => {
        getSetValue(result)('mockValue');
      });

      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=mockValue');
      expect(getValue(result)).toBe('mockValue');
    });
    it('should set the param in the url and now return it if the setter is passed an updater function', () => {
      const { result } = renderHook(() => useQueryParameter('mockKey', 'defaultValueMock', 'required'));

      expect(getValue(result)).toBe('defaultValueMock');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=defaultValueMock');

      act(() => {
        getSetValue(result)((prevValue) => `nextMockValue-${prevValue}`);
      });

      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=nextMockValue-defaultValueMock');
      expect(getValue(result)).toBe('nextMockValue-defaultValueMock');

      act(() => {
        getSetValue(result)((prevValue) => `nextMockValue-${prevValue}`);
      });

      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=nextMockValue-nextMockValue-defaultValueMock');
      expect(getValue(result)).toBe('nextMockValue-nextMockValue-defaultValueMock');
    });
    it('should not remove the param if the value is returned to the default value', () => {
      const { result } = renderHook(() => useQueryParameter('mockKey', '', 'required'));

      expect(getValue(result)).toBe('');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=');

      act(() => {
        getSetValue(result)('mockValue');
      });

      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=mockValue');
      expect(getValue(result)).toBe('mockValue');

      act(() => {
        getSetValue(result)('');
      });

      expect(getValue(result)).toBe('');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=');
    });
    it('should not remove the param if the value is returned to the default value if the default value is provided', () => {
      const { result } = renderHook(() => useQueryParameter('mockKey', 'defaultValueMock', 'required'));

      expect(getValue(result)).toBe('defaultValueMock');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=defaultValueMock');

      act(() => {
        getSetValue(result)('mockValue');
      });

      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=mockValue');
      expect(getValue(result)).toBe('mockValue');

      act(() => {
        getSetValue(result)('defaultValueMock');
      });

      expect(getValue(result)).toBe('defaultValueMock');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=defaultValueMock');
    });
    it('should inherit the value from the url if it exists when the hook mounts', () => {
      const { result } = renderHook(() => useQueryParameter('mockExistingParam', '', 'required'));

      expect(getValue(result)).toBe('mockExistingValue');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');
    });
    it('should not remove the key from the url if the value becomes the default', () => {
      const { result } = renderHook(() => useQueryParameter('mockExistingParam', 'defaultValueMock', 'required'));

      expect(getValue(result)).toBe('mockExistingValue');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');

      act(() => {
        getSetValue(result)('defaultValueMock');
      });

      expect(getValue(result)).toBe('defaultValueMock');
      expect(window.location.search).toBe('?mockExistingParam=defaultValueMock');
    });
  });
  describe('mode="simple"', () => {
    it('should return empty string, and not modify the url', () => {
      const { result } = renderHook(() => useQueryParameter('mockKey', '', 'simple'));

      expect(getValue(result)).toBe('');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');
    });
    it('should set the param in the url and return it if the setter is called', () => {
      const { result } = renderHook(() => useQueryParameter('mockKey', '', 'simple'));

      expect(getValue(result)).toBe('');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');

      act(() => {
        getSetValue(result)('mockValue');
      });

      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=mockValue');
      expect(getValue(result)).toBe('mockValue');
    });
    it('should set the param in the url and now return it if the setter is passed an updater function', () => {
      const { result } = renderHook(() => useQueryParameter('mockKey', 'defaultValueMock', 'simple'));

      expect(getValue(result)).toBe('defaultValueMock');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');

      act(() => {
        getSetValue(result)((prevValue) => `nextMockValue-${prevValue}`);
      });

      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=nextMockValue-defaultValueMock');
      expect(getValue(result)).toBe('nextMockValue-defaultValueMock');

      act(() => {
        getSetValue(result)((prevValue) => `nextMockValue-${prevValue}`);
      });

      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=nextMockValue-nextMockValue-defaultValueMock');
      expect(getValue(result)).toBe('nextMockValue-nextMockValue-defaultValueMock');
    });
    it('should not remove the param if the value is returned to the default value', () => {
      const { result } = renderHook(() => useQueryParameter('mockKey', '', 'simple'));

      expect(getValue(result)).toBe('');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');

      act(() => {
        getSetValue(result)('mockValue');
      });

      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=mockValue');
      expect(getValue(result)).toBe('mockValue');

      act(() => {
        getSetValue(result)('');
      });

      expect(getValue(result)).toBe('');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=');
    });
    it('should not remove the param if the value is returned to the default value if the default value is provided', () => {
      const { result } = renderHook(() => useQueryParameter('mockKey', 'defaultValueMock', 'simple'));

      expect(getValue(result)).toBe('defaultValueMock');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');

      act(() => {
        getSetValue(result)('mockValue');
      });

      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=mockValue');
      expect(getValue(result)).toBe('mockValue');

      act(() => {
        getSetValue(result)('defaultValueMock');
      });

      expect(getValue(result)).toBe('defaultValueMock');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue&mockKey=defaultValueMock');
    });
    it('should inherit the value from the url if it exists when the hook mounts', () => {
      const { result } = renderHook(() => useQueryParameter('mockExistingParam', '', 'simple'));

      expect(getValue(result)).toBe('mockExistingValue');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');
    });
    it('should not remove the key from the url if the value becomes the default', () => {
      const { result } = renderHook(() => useQueryParameter('mockExistingParam', 'defaultValueMock', 'simple'));

      expect(getValue(result)).toBe('mockExistingValue');
      expect(window.location.search).toBe('?mockExistingParam=mockExistingValue');

      act(() => {
        getSetValue(result)('defaultValueMock');
      });

      expect(getValue(result)).toBe('defaultValueMock');
      expect(window.location.search).toBe('?mockExistingParam=defaultValueMock');
    });
  });
});
