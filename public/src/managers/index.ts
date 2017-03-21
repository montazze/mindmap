import * as EventEmitter from 'events';

import { getStore } from '../store';

import {TOPIC_ROOT} from '../constants/Common';

import * as CommonFunc from '../apptools/commonfunc';

export const events = new EventEmitter();

export const selectionsManager = (() => {

  const selections = [];

  const getSelectionsArray = () => {
    return selections;
  };

  const addSelection = (selection) => {

    if (selections.indexOf(selection) < 0) {
      selections.push(selection);
    }

  };

  const selectSingle = (selection) => {
    clearSelection();
    addSelection(selection);
  };

  const clearSelection = () => {

    if (!selections.length) return false;

    selections.forEach((selection) => {
      selection.onDeselected();
    });

    selections.splice(0);
  };

  const removeSelection = (selection) => {
    if ((<any>selections).includes(selection)) {
      selections.splice(selections.indexOf(selection), 1);
    }
  };

  const getSelectionsArrayWithoutChild = () => {
    const isAAncestorOfB = getAncestorCheckMethod(selections);

    return selections.filter((selectionB) => {
      return !selections.some((selectionA) => {
          return isAAncestorOfB(selectionA, selectionB);
        }) && selectionB.getType() !== TOPIC_ROOT;
    });
  };

  const getAncestorCheckMethod = (selections) => {
    const ancestorMap = {};

    const topicsInfo = getStore().getState().topics;

    selections.forEach((selection) => {
      getSelectionsAncestorList(selection);
    });

    return function (selectionA, selectionB) {
      return selectionA.props.id !== topicsInfo.id && ancestorMap[selectionB.props.id].includes(selectionA.props.id);
    };

    function getSelectionsAncestorList(selection) {
      const targetId = selection.props.id;
      const targetList = ancestorMap[targetId] = [];

      if (targetId === topicsInfo.id) return;

      search();

      function search(searchSource = topicsInfo) {
        if (!searchSource.children) return;

        for (const childTopic of searchSource.children) {
          if (childTopic.id === targetId) {
            targetList.push(searchSource.id);
            return true;
          }

          targetList.push(searchSource.id);
          if (search(childTopic)) {
            return true;
          }

          targetList.pop();
        }
      }
    }
  };

  return { getSelectionsArray, addSelection, selectSingle, clearSelection, removeSelection, getSelectionsArrayWithoutChild }
})();

export const pasteInfoManager = (() => {
  let componentInfoToBePasted;

  const refreshInfo = (info) => {
    componentInfoToBePasted = CommonFunc.deepClone(info);
  };

  const getInfo = () => {
    return CommonFunc.replaceInfoId(componentInfoToBePasted);
  };

  const hasInfoStashed = () => {
    return !!componentInfoToBePasted;
  };

  return {refreshInfo, getInfo, hasInfoStashed};
})();

export const componentMapManager = (() => {
  let sheetComponent;

  const map = {};

  return {
    addComponent(id: string, component) {
      map[id] = component;
    },

    removeComponent(id: string) {
      delete map[id];
    },

    getMap() {
      return map;
    },

    get sheetComponent() {
      return sheetComponent;
    },

    set sheetComponent(component) {
      if (sheetComponent) return;
      sheetComponent = component;
    }
  }
})();