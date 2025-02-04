import { ReactElement, useState } from 'react';
import { SafeParseError, SafeParseReturnType } from 'zod';

import { CopyableConversionInput } from '../../src/components/CopyableConversionInput';
import { CalculatorIcon } from '../../src/components/icons/CalculatorIcon';
import { Header } from '../../src/components/lib/Header/Header';
import { ToolContainer } from '../../src/components/ToolContainer';
import { convertBase } from '../../src/lib/convertBase';
import { Base, base } from '../../src/lib/convertBaseProperties';
import { WithError } from '../../src/misc/types';
import { binarySchema } from '../../src/misc/validation/schemas/binarySchema';
import { hexSchema } from '../../src/misc/validation/schemas/hexSchema';
import { octalSchema } from '../../src/misc/validation/schemas/octalSchema';
import { unitSchema } from '../../src/misc/validation/schemas/unitSchema';
import { zodResultMessage } from '../../src/misc/zodResultMessage';

interface BaseConversionState extends Record<Base, WithError<string>> {}

const initialState: BaseConversionState = {
  binary: { value: '' },
  octal: { value: '' },
  decimal: { value: '' },
  hexadecimal: { value: '' },
};

export default function NumberBaseConversion(): ReactElement {
  const [state, setState] = useState<BaseConversionState>(initialState);

  function handleChangeValue(newValue: string, currentType: Base): void {
    let parseResult: SafeParseReturnType<string, string> | undefined;
    switch (currentType) {
      case 'binary':
        parseResult = binarySchema.safeParse(newValue);
        break;
      case 'octal':
        parseResult = octalSchema.safeParse(newValue);
        break;
      case 'decimal':
        parseResult = unitSchema.safeParse(newValue);
        break;
      case 'hexadecimal':
        parseResult = hexSchema.safeParse(newValue);
        break;
      default:
        // this won't happen
        break;
    }

    if (parseResult && !parseResult.success) {
      setState((state) => ({
        ...state,
        [currentType]: {
          value: newValue,
          error: zodResultMessage(parseResult as SafeParseError<unknown>),
        },
      }));
      // return here to not override error set above
      return;
    }

    setState({ ...state, [currentType]: { value: newValue, error: '' } });

    setState((state) => {
      const newState = { ...state };
      for (const unit of base) {
        if (unit === currentType) {
          newState[unit] = { value: newValue };
        } else {
          const convertedValue = convertBase(newValue, currentType, unit);
          if (convertedValue && !isNaN(parseInt(convertedValue))) {
            newState[unit] = { value: convertedValue };
          }
        }
      }
      return newState;
    });
  }

  return (
    <ToolContainer>
      <form className="mr-auto flex w-full flex-col items-start sm:items-center md:items-start">
        <Header
          icon={<CalculatorIcon height={24} width={24} />}
          text={['Calculators', 'Number Base Conversion']}
        />
        <section className="flex w-full flex-col gap-5">
          <ConversionInputs
            handleChangeValue={handleChangeValue}
            state={state}
          />
        </section>
      </form>
    </ToolContainer>
  );
}
interface ConversionInputsProps {
  state: BaseConversionState;
  handleChangeValue: (newValue: string, currentType: Base) => void;
}

function ConversionInputs({
  state,
  handleChangeValue,
}: ConversionInputsProps): JSX.Element {
  return (
    <>
      <CopyableConversionInput
        name="Binary"
        {...state['binary']}
        onChange={(e) => handleChangeValue(e.target.value, 'binary')}
      />
      <CopyableConversionInput
        name="Octal"
        {...state['octal']}
        onChange={(e) => handleChangeValue(e.target.value, 'octal')}
      />
      <CopyableConversionInput
        name="Decimal"
        {...state['decimal']}
        onChange={(e) => handleChangeValue(e.target.value, 'decimal')}
      />
      <CopyableConversionInput
        name="Hexadecimal"
        {...state['hexadecimal']}
        onChange={(e) => handleChangeValue(e.target.value, 'hexadecimal')}
      />
    </>
  );
}
