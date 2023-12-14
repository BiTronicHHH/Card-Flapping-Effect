import * as React from 'react';
import { forwardRef } from 'react';
import CloseCircleFilled from '@ant-design/icons/CloseCircleFilled';
import classNames from 'classnames';
import type { BaseInputProps } from 'rc-input/lib/interface';
import type { TextAreaRef as RcTextAreaRef } from 'rc-textarea';
import RcTextArea from 'rc-textarea';
import type { TextAreaProps as RcTextAreaProps } from 'rc-textarea/lib/interface';

import type { InputStatus } from '../_util/statusUtils';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import { ConfigContext } from '../config-provider';
import DisabledContext from '../config-provider/DisabledContext';
import useSize from '../config-provider/hooks/useSize';
import type { SizeType } from '../config-provider/SizeContext';
import { FormItemInputContext } from '../form/context';
import type { InputFocusOptions } from './Input';
import { triggerFocus } from './Input';
import useStyle from './style';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';

export interface TextAreaProps extends Omit<RcTextAreaProps, 'suffix'> {
  bordered?: boolean;
  size?: SizeType;
  status?: InputStatus;
  rootClassName?: string;
}

export interface TextAreaRef {
  focus: (options?: InputFocusOptions) => void;
  blur: () => void;
  resizableTextArea?: RcTextAreaRef['resizableTextArea'];
}

const TextArea = forwardRef<TextAreaRef, TextAreaProps>((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    bordered = true,
    size: customizeSize,
    disabled: customDisabled,
    status: customStatus,
    allowClear,
    classNames: classes,
    rootClassName,
    className,
    ...rest
  } = props;
  const { getPrefixCls, direction } = React.useContext(ConfigContext);

  // ===================== Size =====================
  const mergedSize = useSize(customizeSize);

  // ===================== Disabled =====================
  const disabled = React.useContext(DisabledContext);
  const mergedDisabled = customDisabled ?? disabled;

  // ===================== Status =====================
  const {
    status: contextStatus,
    hasFeedback,
    feedbackIcon,
  } = React.useContext(FormItemInputContext);
  const mergedStatus = getMergedStatus(contextStatus, customStatus);

  // ===================== Ref =====================
  const innerRef = React.useRef<RcTextAreaRef>(null);

  React.useImperativeHandle(ref, () => ({
    resizableTextArea: innerRef.current?.resizableTextArea,
    focus: (option?: InputFocusOptions) => {
      triggerFocus(innerRef.current?.resizableTextArea?.textArea, option);
    },
    blur: () => innerRef.current?.blur(),
  }));

  const prefixCls = getPrefixCls('input', customizePrefixCls);

  // Allow clear
  let mergedAllowClear: BaseInputProps['allowClear'];
  if (typeof allowClear === 'object' && allowClear?.clearIcon) {
    mergedAllowClear = allowClear;
  } else if (allowClear) {
    mergedAllowClear = { clearIcon: <CloseCircleFilled /> };
  }

  // ===================== Style =====================
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle(prefixCls, rootCls);

  return wrapCSSVar(
    <RcTextArea
      {...rest}
      disabled={mergedDisabled}
      allowClear={mergedAllowClear}
      className={classNames(cssVarCls, rootCls, className, rootClassName)}
      classes={{
        affixWrapper: classNames(
          `${prefixCls}-textarea-affix-wrapper`,
          {
            [`${prefixCls}-affix-wrapper-rtl`]: direction === 'rtl',
            [`${prefixCls}-affix-wrapper-borderless`]: !bordered,
            [`${prefixCls}-affix-wrapper-sm`]: mergedSize === 'small',
            [`${prefixCls}-affix-wrapper-lg`]: mergedSize === 'large',
            [`${prefixCls}-textarea-show-count`]: props.showCount || props.count?.show,
          },
          getStatusClassNames(`${prefixCls}-affix-wrapper`, mergedStatus),
          hashId,
        ),
      }}
      classNames={{
        ...classes,
        textarea: classNames(
          {
            [`${prefixCls}-borderless`]: !bordered,
            [`${prefixCls}-sm`]: mergedSize === 'small',
            [`${prefixCls}-lg`]: mergedSize === 'large',
          },
          getStatusClassNames(prefixCls, mergedStatus),
          hashId,
          classes?.textarea,
        ),
      }}
      prefixCls={prefixCls}
      suffix={hasFeedback && <span className={`${prefixCls}-textarea-suffix`}>{feedbackIcon}</span>}
      ref={innerRef}
    />,
  );
});

export default TextArea;
