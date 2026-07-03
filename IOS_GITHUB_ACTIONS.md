# iOS IPA GitHub Actions 构建说明

本仓库已配置：

```text
.github/workflows/build-ios-ipa.yml
```

## 自动构建 unsigned IPA

每次 push 到 `main` 会自动启动一次 unsigned iOS IPA 构建。

查看位置：

```text
https://github.com/xiumao0001/lxios/actions
```

构建完成后，在对应 workflow run 页面底部下载 artifact：

```text
LXMusic-unsigned-ipa
```

说明：unsigned IPA 主要用于验证 iOS 工程是否能成功编译，通常不能直接安装到普通 iPhone。

## 手动构建

GitHub 页面：

```text
Actions -> Build iOS IPA -> Run workflow
```

默认参数即可构建 unsigned IPA：

```text
signing = unsigned
bundle_id = cn.toside.music.mobile
export_method = development
node_version = 18
xcode_path = /Applications/Xcode_16.4.app
```

## signed IPA

如需生成可安装的 signed IPA，在仓库设置里添加：

```text
Settings -> Secrets and variables -> Actions -> New repository secret
```

需要的 secrets：

```text
IOS_TEAM_ID
IOS_CERTIFICATE_BASE64
IOS_CERTIFICATE_PASSWORD
IOS_PROVISION_PROFILE_BASE64
KEYCHAIN_PASSWORD
```

然后手动运行 workflow，选择：

```text
signing = signed
```
