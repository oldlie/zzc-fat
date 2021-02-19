# 第一阶段需求


记录基金基本信息，记录每日变化，自动生成月变化，年变化；生成每只基金的每周，月趋势图表；生成所有基金的风格占比；生成所有基金的资金占比；生成总资金的周，月趋势图表；

1.  基金基本信息记录
2.  基金每日变动信息记录
3.  自动生成每月变动信息记录
4.  自动生成每年变动信息记录
5.  基金风格池表
6.  基金风格映射表

### 基金基本信息

funds_basic_info

|字段|类型|默认值|说明|
|:----|:----|:----|:----|
|id|number||auto_increment|
|d|number||记录日期，1-31|
|m|number||记录月份，1-12|
|y|number||记录年份，yyyy|
|ymd|number||年月日，yyyyMMdd|
|code|string||基金代码|
|title|string||基金名称|
|fund_net|number||基金净值，精确到小数点后两位|
|fund_share|number||基金份额|
|current_amount|number||当前金额，精确到小数点后两位|
|fund_change|number||涨跌幅|

### 基金每日变动

funds_daily_log

|字段|类型|默认值|说明|
|:----|:----|:----|:----|
|id|number||auto_increment|
|d|number||记录日期，1-31|
|m|number||记录月份，1-12|
|y|number||记录年份，yyyy|
|ymd|number||年月日，yyyyMMdd|
|code|string||基金代码|
|fund_change|number||涨跌幅|
|fund_change_amount|number||涨跌金额|
|current_amount|number||当前金额,上一天的记录+涨跌金额，精确到小数点后两位|
|fixed_amount|number||修正的当前金额，精确到小数点后两位；不填写时复制当前金额，当APP中的金额和计算出来的金额不一致时手动填写，此时以手动填写的为准|

### 基金月报

funds_month_log

|字段|类型|默认值|说明|
|:----|:----|:----|:----|
|id|number||auto_increment|
|m|number||记录月份，1-12|
|y|number||记录年份，yyyy|
|ymd|number||年月日，yyyyMMdd|
|code|string||基金代码|
|fund_change|number||涨跌幅|
|fund_change_amount|number||涨跌金额|
|current_amount|number||当前金额,上一天的记录+涨跌金额，精确到小数点后两位|
|fixed_amount|number||修正的当前金额，精确到小数点后两位；不填写时复制当前金额，当APP中的金额和计算出来的金额不一致时手动填写，此时以手动填写的为准|

### 基金年报

funds_year_log

|字段|类型|默认值|说明|
|:----|:----|:----|:----|
|id|number||auto_increment|
|ymd|number||年月日，yyyyMMdd|
|code|string||基金代码|
|fund_change|number||涨跌幅|
|fund_change_amount|number||涨跌金额|
|current_amount|number||当前金额,上一天的记录+涨跌金额，精确到小数点后两位|
|fixed_amount|number||修正的当前金额，精确到小数点后两位；不填写时复制当前金额，当APP中的金额和计算出来的金额不一致时手动填写，此时以手动填写的为准|

### 基金风格池

funds_style_pool，存放基金风格类型

|字段|类型|默认值|说明|
|:----|:----|:----|:----|
|id|number||auto_increment|
|title|string||风格名称|

### 基金风格映射表

funds_style

|字段|类型|默认值|说明|
|:----|:----|:----|:----|
|id|number||auto_increment|
|code|string||基金代码|
|sid|number||基金风格id|
|s_title|string||基金风格名称，冗余字段|
funds_style