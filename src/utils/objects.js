/*
 * @Description:
 * @version:
 * @Author: Hayden
 * @Date: 2019-12-23 10:47:23
 * @LastEditors: Hayden
 * @LastEditTime: 2020-07-03 10:12:30
 */
export default
{
  /**
   * @author: Hayden
   * @Date: 2019-12-24 11:45:54
   * @function: 创建分页数据
   * @description:
   * @param {type}
   * @return:
   */
  CreateTablePage() {
    const tablePage = {
      pageSize: 20, // 每页数量
      total: 1, // 总数
      pageNum: 1 // 当前页码
    }
    return tablePage
  },
  /**
   * @author: Hayden
   * @Date: 2020-01-17 16:57:36
   * @function: 根据分页数据创建分页查询Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateTablePageSearchDto(page) {
    const dto = {
      pageNumber: page.pageNum, // 当前页码
      maxResultCount: page.pageSize // 每页数量
    }
    return dto
  },
  /**
   * @author: Hayden
   * @Date: 2020-04-08 14:45:27
   * @function: 创建树节点Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateTreeDto() {
    const dto = {
      id: '00000000-0000-0000-0000-000000000000', // 节点Key
      label: null, // 节点标签
      children: [], // 子节点
      isLeaf: false, // 是否叶子节点
      isOrganization: false, // 是否机构节点
      iconName: null, // 节点ICON
      className: null, // 节点样式类
      disabled: false, // 节点是否被禁用
      ParentId: null, // 父节点key
      TenantId: null
    }
    return dto
  },

  // #region 通用服务相关Dto
  /**
   * @author: Hayden
   * @Date: 2020-02-05 15:57:30
   * @function: 图片质量检测请求Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreatePhotoQualityReq() {
    // 图片质量检测请求
    const dto = {
      photoFormat: '1', // 图片文件格式 1:jpg 2:bmp 3:png
      photoSrc: '' // 图片数据
    }
    return dto
  },
  // #endregion

  // #region 时间表相关Dto
  /**
   * @author: Hayden
   * @Date: 2020-01-17 17:16:44
   * @function: 创建查找时间表时输入搜索数据
   * @description:
   * @param {type}
   * @return:
   */
  CreateScheduleSearchData() {
    const dto = {
      id: null, // 时间表Id
      scheduleName: null, // 时间表名称
      type: 0, // 时间表类型,0-普通时间表；1-特殊时间表
      getScheduleTimes: false // 是否获取时间段信息
    }
    return dto
  },
  /**
   * @author: Hayden
   * @Date: 2020-01-17 17:20:29
   * @function: 创建时间表数据Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateSchedule() {
    // 时间表数据
    const dto = {
      id: '00000000-0000-0000-0000-000000000000',
      type: 0, // 时间表类型,0-普通时间表，1-特殊时间窗
      number: 0, // 时间表编号
      name: '', // 时间表名称
      priorityType: null, // 优先时间表类型
      priorityScheduleID: null, // 优先时间表ID
      priorityNumber: null, // 优先时间表编号
      note: null, // 备注
      isDefault: false, // 是否默认时间表
      scheduleTimes: [] // 时间段信息
    }
    return dto
  },
  // #endregion

  // #region 区域相关数据Dto
  /**
   * @author: Hayden
   * @Date: 2020-01-17 14:32:39
   * @function: 创建查找区域时输入搜索数据
   * @description:
   * @param {type}
   * @return:
   */
  CreateAccessZoneSearchData() {
    const dto = {
      id: null, // 区域Id
      accessZoneName: null, // 区域名称
      organizationId: null // 区域所属机构Id
    }
    return dto
  },
  /**
   * @author: Hayden
   * @Date: 2020-01-17 14:34:49
   * @function: 创建区域数据Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateAccessZone() {
    // 区域数据
    const dto = {
      id: '00000000-0000-0000-0000-000000000000',
      orgID: null, // 归属机构
      parentID: null, // 父区域ID
      number: 0, // 区域编号
      name: '', // 区域名称
      workMode: 3, // 工作模式，默认3-卡模式
      scheduleID: null, // 时间表ID
      scheduleInWorkMode: null, // 进入时间表的工作模式
      scheduleOutWorkMode: null, // 离开时间表的工作模式
      firstCardOpenEnabled: false, // 启用首卡开门
      apbEnabled: false, // 启用区域反回传
      coerceAlarmEnabled: false, // 启用胁迫报警
      multiCardsAccessGroup1: null, // 多卡开门权限组编号1
      multiCardsAccessGroup2: null, // 多卡开门权限组编号2
      multiCardsAccessGroup3: null, // 多卡开门权限组编号3
      doors: []
    }
    return dto
  },
  // #endregion

  // #region 权限组相关数据Dto
  /**
   * @author: Hayden
   * @Date: 2020-01-07 14:48:27
   * @function: 创建查找人员权限组输入搜索数据
   * @description:
   * @param {type}
   * @return:
   */
  CreateStaffAccessGroupSearchData() {
    const dto = {
      accessGroupID: null, // 权限组ID
      staffID: null, // 人员ID
      staffName: null, // 人员名称
      organizationID: null, // 人员所属机构
      tenantID: null // 权限组所属分服务器
    }
    return dto
  },
  /**
   * @author: Hayden
   * @Date: 2020-01-07 14:50:30
   * @function: 创建查找权限组时输入搜索数据
   * @description:
   * @param {type}
   * @return:
   */
  CreateAccessGroupSearchData() {
    const dto = {
      id: null, // 权限组id
      accessGroupName: null, // 权限组名称
      tenantID: null // 权限组所属分服务器
    }
    return dto
  },
  /**
   * @author: Hayden
   * @Date: 2020-01-17 14:55:16
   * @function: 创建权限组数据Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateAccessGroup() {
    // 权限组数据
    const dto = {
      id: '00000000-0000-0000-0000-000000000000', // 权限组Id
      number: 0, // 权限组编号
      name: '', // 权限组名称
      parentID: null, // 父权限组ID
      parentName: null, // 父权限组名称
      accesses: [] // 权限组包含的权限
    }
    return dto
  },
  // #endregion

  // #region 人员相关数据Dto
  /**
   * @author: Hayden
   * @Date: 2019-12-24 11:41:00
   * @function: 创建人员搜索数据
   * @description:
   * @param {type}
   * @return:
   */
  CreateStaffSearchData() {
    // 人员搜索数据
    const staffSearchData = {
      id: null, // 人员id
      staffId: null, // 人员id
      staffName: null, // 人员名称
      staffNumber: null, // 人员编号
      idNumber: null, // 证件号码
      gender: null, // 性别
      organizationId: null, // 归属机构ID
      includeSubOrganization: false, // 查询所属机构时，是否包含下级机构
      allOrganization: true, // 是否查询所有机构
      validityStatus: null, // 人员有效期状态
      toExpireDays: null, // 查询N天后过期的人员
      tenantId: null // 租户Id
    }
    return staffSearchData
  },

  /**
   * @author: Hayden
   * @Date: 2019-12-24 11:51:16
   * @function: 创建人员Dto数据
   * @description:
   * @param {type}
   * @return:
   */
  CreateStaff() {
    // 人员数据
    const staff = {
      id: '00000000-0000-0000-0000-000000000000', // 人员ID
      staffName: null, // 人员名称
      staffNumber: null, // 人员编号
      gender: 1, // 性别
      idType: null, // 证件类型
      idNumber: null, // 证件号码
      idPhoto: null, // 证件照片
      mobilePhone: null, // 手机号码
      telephone: null, // 固定电话
      position: null, // 职位
      photo: null, // 人员照片
      privilegeCategory: 0, // 人员类型 0：普通用户 1：特权用户
      startTime: '2019-01-01 00:00:00', // 生效日期
      expiryTime: '2019-01-01 23:59:59', // 失效日期
      pin: null, // 个人密码，6位数字
      organizationIDs: [], // 所属部门
      originalPhoto: null, // 人员原照片
      originalIdPhoto: null// 人员原证件照片
    }
    return staff
  },

  /**
   * @author: Hayden
   * @Date: 2020-01-02 17:13:53
   * @function: 创建人员自定义字段搜索数据
   * @description:
   * @param {type}
   * @return:
   */
  CreateStaffCustomFieldSearchData() {
    // 人员自定义字段搜索数据
    const searchData = {
      name: null // 自定义字段名称
    }
    return searchData
  },

  /**
   * @author: Hayden
   * @Date: 2020-01-02 17:13:53
   * @function: 创建人员自定义字段Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateStaffCustomField() {
    const dto = {
      id: '00000000-0000-0000-0000-000000000000', // ID
      name: null, // 自定义字段名称
      isRequired: false, // 是否必填
      isUnique: false, // 是否唯一
      sortedNumber: 0 // 排列序号
    }
    return dto
  },

  /**
   * @author: Hayden
   * @Date: 2020-01-02 17:13:53
   * @function: 创建人员自定义信息Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateStaffCustomInformation() {
    const dto = {
      id: '00000000-0000-0000-0000-000000000000', // ID
      staffId: '00000000-0000-0000-0000-000000000000', // 人员ID
      customId: '00000000-0000-0000-0000-000000000000', // 自定义字段Id
      customName: null, // 自定义字段名称
      isRequired: false, // 是否必填
      isUnique: false, // 是否唯一
      value: null // 自定义字段值
    }
    return dto
  },

  /**
   * @author: Hayden
   * @Date: 2020-01-02 17:13:53
   * @function: 创建人员自定义信息集合Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateStaffCustoms() {
    const dto = {
      staffCustoms: [] // 人员自定义信息集合
    }
    return dto
  },

  /**
   * @author: Hayden
   * @Date: 2020-01-06 15:37:16
   * @function: 创建人员操作员dto数据
   * @description:
   * @param {type}
   * @return:
   */
  CreateStaffUser() {
    const dto = {
      id: '00000000-0000-0000-0000-000000000000', // Id
      userName: null, // 用户名
      password: null, // 密码
      newPassword: null, // 新密码
      nickname: null, // 昵称
      organizationID: null // 所属机构
    }
    return dto
  },
  /**
   * @author: Hayden
   * @Date: 2020-01-16 17:31:56
   * @function: 创建查找部门人员输入Dto数据
   * @description:
   * @param {type}
   * @return:
   */
  CreateDeptStaffsSearchData() {
    // 查找部门人员输入Dto数据
    const searchData = {
      deptId: null // 部门Id
    }
    return searchData
  },
  /**
   * @author: Hayden
   * @Date: 2020-03-02 19:27:44
   * @function: 创建查找部门及人员查找输入Dto数据
   * @description:
   * @param {type}
   * @return:
   */
  CreateDeptsAndStaffsSearchData() {
    // 查找部门及人员输入Dto数据
    const searchData = {
      loadDeptStaffs: false, // 加载部门下属的人员
      staffMaxAccessGroupCount: null, // 获取权限组数量少于该值的人员
      excludeAccessGroupId: null // 权限组筛选时需排除的权限组Id
    }
    return searchData
  },
  // #endregion

  // #region 人员导入相关枚举
  /**
   * @author: Hayden
   * @Date: 2020-06-18 10:14:42
   * @function: 创建人员导入设置信息Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateStaffImportSetting() {
    const dto = {
      importUniqueID: 0, // 导入人员唯一标识，默认人员编号，具体定义见 ImportUniqueIDEnum
      sameOption: 0// 导入数据时出现唯一标识重复的操作选项，默认跳过，具体定义见 ImportOptionEnum
    }
    return dto
  },
  /**
   * @author: Hayden
   * @Date: 2020-06-18 10:15:28
   * @function: 创建人员图片导入设置信息Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateStaffPhotoImportSetting() {
    const dto = {
      importUniqueID: 0// 导入图片命名格式标识，默认人员编号，具体定义见 ImportUniqueIDEnum
    }
    return dto
  },
  /**
   * @author: Hayden
   * @Date: 2020-06-18 10:17:46
   * @function: 创建人员导入Excel表格数据Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateStaffImportExcel() {
    const dto = {
      rowIndex: -1, // Excel表格行号
      staffName: null, // 人员姓名
      staffNumber: null, // 人员编号
      position: null, // 职位
      gender: null, // 性别
      iIdType: null, // 证件类型
      idNumber: null, // 证件号码
      mobilePhone: null, // 移动电话
      telephone: null, // 固定电话
      privilegeCategory: null, // 人员类型
      startTime: null, // 生效日期
      expiryTime: null, // 失效日期
      pin: null, // 个人密码，6位数字
      orgCNames: null, // 人员所属机构名称集合
      cardNumbers: null, // 卡片编号集合
      accessGroupNames: null, // 通行权限名称集合
      useFace: null, // 刷脸通行
      actionType: null, // 导入操作，A：新增；D：删除；
      promptMessage: null, // 导入提示
      importStatus: 0// 导入状态，具体定义参考枚举ImportResultCodeEnum
    }
    return dto
  },
  /**
   * @author: Hayden
   * @Date: 2020-06-28 16:36:16
   * @function: 创建人员导入图片数据Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateStaffImportPhoto() {
    const dto = {
      pid: null, // 导入图片的ID
      name: null, // 导入的图片文件名称
      photo: null, // 图片文件数据
      promptMessage: null, // 导入提示
      importStatus: 0// 导入状态，具体定义参考枚举ImportResultCodeEnum
    }
    return dto
  },
  // #endregion

  // #region 凭证相关数据Dto
  /**
   * @author: Hayden
   * @Date: 2019-12-23 11:11:17
   * @function: 创建凭证dto数据
   * @description:
   * @param {type:凭证类型}
   * @return:
   */
  CreateCredential(type) {
    const credential = {
      id: '00000000-0000-0000-0000-000000000000', // 凭证Id
      staffId: null, // 所属人员ID
      staffName: null, // 所属人员名称
      number: 0, // 凭证编号
      isEnabled: true, // 是否启用
      type: type === null ? 0 : type, // 凭证类型
      subType: null, // 凭证子类型
      creationTime: '2019-01-01', // 创建时间
      photo: null, // 人脸凭证的图片
      newPhoto: null, // 人脸凭证新的图片，需更新到人员的图片
      fingerprints: [], // 凭证包括的指纹数据
      deleteFingerprintIds: [] // 需要删除的指纹ID
    }
    return credential
  },
  CreateDefaultCredential() {
    return this.CreateCredential(null)
  },
  /**
   * @author: Hayden
   * @Date: 2019-12-23 16:19:20
   * @function: 创建凭证搜索数据
   * @description:
   * @param {type}
   * @return:
   */
  CreateCredentialSearchData() {
    const searchData = {
      staffId: null, // 所属人员ID
      number: null, // 凭证编号
      staffName: null, // 所属人员名称
      type: null, // 凭证类型
      orderByStaffName: false // 按人员名称升序排序
    }
    return searchData
  },
  // #endregion

  // #region 指纹相关Dto数据
  /**
   * @author: Hayden
   * @Date: 2019-12-25 17:14:49
   * @function: 创建指纹dto数据
   * @description:
   * @param {type}
   * @return:
   */
  CreateFingerprint() {
    const fingerprint = {
      id: '00000000-0000-0000-0000-000000000000', // 指纹Id
      staffID: '00000000-0000-0000-0000-000000000000', // 所属人员ID
      fingerIndex: null, // 手指索引
      data: null// 指纹数据
    }
    return fingerprint
  },
  // #endregion

  // #region 字典相关Dto数据
  /**
   * @author: Hayden
   * @Date: 2020-01-09 19:29:53
   * @function: 创建字典Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateDictionary() {
    const dto = {
      id: '00000000-0000-0000-0000-000000000000', // Id
      code: null, // 字典代码
      name: null, // 字典名称
      displayName: null, // 字典显示名称
      description: null, // 描述说明
      dictionaryItems: null // 字典字段集合
    }
    return dto
  },
  /**
   * @author: Hayden
   * @Date: 2020-01-09 19:29:37
   * @function: 创建字典查找输入Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateDictionarySearchData() {
    const searchData = {
      code: null, // 字典代码
      displayName: null, // 字典显示名称
      isLoadDictionaryItem: false // 是否加载字典字段
    }
    return searchData
  },
  /**
   * @author: Hayden
   * @Date: 2020-01-09 19:29:06
   * @function: 创建字典字段Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateDictionaryItem() {
    const dto = {
      id: '00000000-0000-0000-0000-000000000000', // Id
      dictionaryId: '00000000-0000-0000-0000-000000000000', // 所属字典Id
      code: null, // 字典代码
      name: null, // 字典名称
      displayName: null, // 字典显示名称
      value: null, // 字典字段值
      description: null // 描述说明
    }
    return dto
  },
  /**
   * @author: Hayden
   * @Date: 2020-01-09 19:28:58
   * @function: 创建字典字段查找输入Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateDictionaryItemSearchData() {
    const searchData = {
      dictionaryId: null, // 所属字典Id
      dictionaryCode: null, // 所属字典代码
      code: null, // 字典代码
      displayName: null // 字典显示名称
    }
    return searchData
  },
  // #endregion

  /**
   * @author: Wen
   * @Date: 2020-01-19 17:13:53
   * @function: 创建搜索设备信息集合Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateDevice() {
    const dto = {
      controllerDetailDtos: [], // 网络控制器
      localControllerDetailDtos: [], // 就地控制器
      doorDetailDtos: [], // 门
      iOPortDetailDtos: [] // IO
    }
    return dto
  },
  /**
   * @author: Wen
   * @Date: 2020-04-08 17:13:53
   * @function: 创建联动规则信息集合Dto
   * @description:
   * @param {type}
   * @return:
   */
  CreateLinkageDetail() {
    const dto = {
      linkage: {}, // 联动规则基本信息
      linkageTriggerConditions: [], // 联动规则的触发条件，第一阶段只支持单条件，第二阶段才考虑支持多触发条件的联动规则
      linkageActions: [] // 联动规则的联动动作
    }
    return dto
  }
}
