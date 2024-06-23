import { Enum } from './EnumHelper.js'
/**
 * 全局公共枚举类
 */
export default
{
  // 人员性别枚举
  genderEnum: new Enum()
    .add('Male', '男', 1)
    .add('Women', '女', 2),

  // 证件类型
  idTypeEnum: new Enum()
    .add('IDCard', '身份证', 0),

  taggingModeEnum: new Enum()
    .add('书', 'Book', '0')
    .add('光碟', 'CD', '1'),

  transactionLogStatusEnum: new Enum()
    .add('成功', 'success', 'success')
    .add('失败', 'fail', 'fail'),

  roleEnum: new Enum()
    .add('Super Admin', 'Super Admin', 'Super Admin')
    .add('Central Admin', 'Central Admin', 'Central Admin')
    .add('Branch Admin', 'Branch Admin', 'Branch Admin')
    .add('Branch Operator', 'Branch Operator', 'Branch Operator')
    .add('Contractor', 'Contractor', 'Contractor')
    .add('Central Sorter Admin', 'Central Sorter Admin', 'Central Sorter Admin')
    .add('Central Sorter Operator', 'Central Sorter Operator', 'Central Sorter Operator')

  // operationPrivilegeEnum: new Enum()
  //   .add('Super Admin', 'Super Admin', SuperAdminOperationPrivilege)
  //   .add('Branch Admin', 'Branch Admin', BranchAdminOperationPrivilege)
}
