interface Item {
  id: number;
  name: '参数' | '类型' | '是否必填' | '描述' | '枚举';
}

interface FormLabel {
  interName: string;
  isExport: boolean;
  reqParams: string;
  resParams: string;
  reqIsString: boolean;
  resIsString: boolean;
}

interface InterObj {
  name: string;
  type: string;
  desc?: string;
  isRequire?: string;
  value?: string;
  mockValue?: string | number | boolean;
}

export type { Item, FormLabel, InterObj }