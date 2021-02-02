import React, { FC, useEffect, useRef, useState } from 'react';
import Styles from './style.module.scss';
interface DropDownProps {
  autoHide: any;
  onChange: any;
  getContainerNode: any;
  caption: any;
  htmlCaption: any;
  title: any;
  disabled: any;
  showArrow: any;
  arrowActive: any;
  className: any;
  children: any;
}
const DropDown: FC<DropDownProps> = props => {
  const [active, setActive] = useState<boolean>(false);
  const [offsetState, setOffsetState] = useState<number>(0);

  useEffect(() => {
    if (active) {
      fixDropDownPosition();
    }
  }, [active]);

  useEffect(() => {
    if (document) {
      document.body.removeEventListener('click', registerClickEvent);
    }
  }, []);

  const dropDownHandlerElement = useRef();
  const dropDownHandler: any = dropDownHandlerElement.current;

  const dropDownContentElement = useRef();
  const dropDownContent: any = dropDownContentElement.current;

  const fixDropDownPosition = () => {
    const viewRect = props.getContainerNode().getBoundingClientRect();
    const handlerRect = dropDownHandler.getBoundingClientRect();
    const contentRect = dropDownContent.getBoundingClientRect();

    let offset = 0;
    let right =
      handlerRect.right - handlerRect.width / 2 + contentRect.width / 2;
    let left = handlerRect.left + handlerRect.width / 2 - contentRect.width / 2;

    right = viewRect.right - right;
    left -= viewRect.left;

    if (right < 10) {
      offset = right - 10;
    } else if (left < 10) {
      offset = left * -1 + 10;
    }

    if (offset !== offsetState) {
      setOffsetState(offset);
    }
  };

  const registerClickEvent = event => {
    const { autoHide } = props;

    if (
      dropDownContent.contains(event.target) ||
      dropDownHandler.contains(event.target)
    ) {
      return false;
    }

    if (autoHide && active) {
      hide();
    }
    return true;
  };

  const toggle = () => {
    setActive(!active);
  };

  const show = () => {
    setActive(true);
  };

  const hide = () => {
    setActive(false);
  };
  const {
    caption,
    htmlCaption,
    title,
    disabled,
    showArrow,
    arrowActive,
    className,
    children,
  } = props;

  return (
    <div
      className={`${Styles['bf-dropdown']} ${!disabled &&
        active &&
        Styles['active']} ${disabled && Styles['disabled']} ${className}`}
    >
      {htmlCaption ? (
        <button
          type="button"
          className={Styles['dropdown-handler']}
          data-title={title}
          aria-label="Button"
          onClick={toggle}
          dangerouslySetInnerHTML={htmlCaption ? { __html: htmlCaption } : null}
          ref={dropDownHandlerElement}
        />
      ) : (
        <button
          type="button"
          className={Styles['dropdown-handler']}
          data-title={title}
          onClick={toggle}
          ref={dropDownHandlerElement}
        >
          <span>{caption}</span>
          {showArrow !== false ? (
            <i className={Styles['bfi-drop-down']} />
          ) : null}
        </button>
      )}
      <div
        className={Styles['dropdown-content']}
        style={{ marginLeft: offsetState }}
        ref={dropDownContentElement}
      >
        <i
          style={{ marginLeft: offsetState * -1 }}
          className={`${Styles['dropdown-arrow']}, ${arrowActive &&
            Styles['active']}`}
        />
        <div className="dropdown-content-inner">{children}</div>
      </div>
    </div>
  );
};

export default DropDown;
