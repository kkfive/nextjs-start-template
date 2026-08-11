# Docker 构建与运行指南

本项目包含三个可独立部署的应用：

| 服务   | Dockerfile               | 默认访问地址            |
| ------ | ------------------------ | ----------------------- |
| Client | `apps/client/Dockerfile` | `http://localhost:3000` |
| Admin  | `apps/admin/Dockerfile`  | `http://localhost:3001` |
| API    | `apps/api/Dockerfile`    | `http://localhost:8787` |

所有镜像都必须从仓库根目录构建，因为构建过程需要根目录的 pnpm workspace 配置和 lockfile。推荐使用根目录的 `compose.yml` 统一构建和运行。

## 前置要求

- Docker Engine 或 Docker Desktop
- Docker Compose v2

检查安装：

```bash
docker --version
docker compose version
```

## 本地快速开始

首次使用时，从示例创建本地配置：

```bash
cp .env.example .env
```

Docker Compose 会自动读取仓库根目录的 `.env`，不需要额外传入 `--env-file`。如有端口冲突或地址差异，请先修改 `.env`。

构建并后台启动全部服务：

```bash
docker compose up -d --build
```

查看服务状态：

```bash
docker compose ps
```

查看日志：

```bash
docker compose logs -f
```

停止并删除容器与 Compose 网络：

```bash
docker compose down
```

## 只构建镜像

构建全部镜像：

```bash
docker compose build
```

构建指定服务：

```bash
docker compose build client
docker compose build admin
docker compose build api
```

查看生成的本地镜像：

```bash
docker images --filter 'reference=local/kkfive-*'
```

默认镜像名称为：

```text
local/kkfive-client:latest
local/kkfive-admin:latest
local/kkfive-api:latest
```

需要查看完整构建日志时：

```bash
docker compose build --progress=plain
```

需要忽略已有构建缓存时：

```bash
docker compose build --no-cache
```

## 环境变量

`.env.example` 同时为 Compose 插值和本地容器运行提供示例值。真实 `.env` 已被 Git 忽略，不应提交。

| 变量                  | 阶段          | 说明                                            |
| --------------------- | ------------- | ----------------------------------------------- |
| `IMAGE_REGISTRY`      | 构建          | 镜像仓库前缀，本地默认 `local`                  |
| `IMAGE_TAG`           | 构建          | 镜像标签，本地默认 `latest`                     |
| `NEXT_PUBLIC_APP_URL` | 前端构建      | Client 的公开地址                               |
| `NEXT_PUBLIC_API_URL` | 前端构建      | 浏览器访问 API 的公开地址                       |
| `API_BUILD_BASE_URL`  | 前端构建      | Client 构建阶段使用的服务端 API 地址            |
| `API_BASE_URL`        | Client 运行时 | Client 服务端通过 Docker 网络访问 API 的地址    |
| `API_TOKEN`           | Client 运行时 | 可选的服务端兜底令牌，不得作为构建参数传入      |
| `CORS_ORIGINS`        | API 运行时    | API 允许的浏览器 Origin，多个值使用英文逗号分隔 |
| `CLIENT_PORT`         | 本地运行      | Client 映射到宿主机的端口                       |
| `ADMIN_PORT`          | 本地运行      | Admin 映射到宿主机的端口                        |
| `API_PORT`            | 本地运行      | API 映射到宿主机的端口                          |

### 构建时与运行时的区别

`NEXT_PUBLIC_*` 会在 Next.js 构建阶段写入浏览器产物。它们必须在构建前确定，容器启动后修改不会更新已经生成的浏览器代码。因此 Client 和 Admin 镜像当前按部署环境构建。

`API_BASE_URL`、`API_TOKEN` 和 `CORS_ORIGINS` 是服务端运行时配置，由 Compose 或部署平台在容器启动时注入。Token、数据库密码等密钥不得通过 Docker build args 传递。

本地配置中的两个 API 地址用途不同：

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8787
API_BASE_URL=http://api:8787
```

- 浏览器使用 `localhost:8787` 访问宿主机映射端口；
- Client 容器使用 `api:8787` 通过 Compose 内部网络访问 API 服务。

## 本地验证

API 健康检查：

```bash
curl --fail http://localhost:8787/health
```

验证两个前端：

```bash
curl --fail http://localhost:3000
curl --fail http://localhost:3001
```

也可以通过浏览器访问：

- Client：<http://localhost:3000>
- Admin：<http://localhost:3001>
- API：<http://localhost:8787>

## CI 验证与手动构建

常规 CI 与镜像构建相互独立：

- `.github/workflows/ci.yml` 只执行静态检查、测试和应用构建，不构建 Docker 镜像；
- `.github/workflows/docker-images.yml` 只在 GitHub Actions 中手动触发 Docker 镜像构建。

进入 GitHub 仓库的 **Actions → Docker Images → Run workflow**，可选择：

| 选项        | 说明                                            |
| ----------- | ----------------------------------------------- |
| `services`  | 构建全部服务，或只构建 `client`、`admin`、`api` |
| `image_tag` | 自定义镜像标签；留空时使用提交 SHA              |
| `push`      | 是否在构建完成后推送到阿里云容器镜像服务        |

手动构建 Client 或 Admin 前，需要在 GitHub Repository Variables 中配置：

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_API_URL
API_BUILD_BASE_URL
```

只构建 API 时不要求这些前端变量。工作流会在构建前校验所选服务需要的变量，缺少配置时立即失败。

选择 `push=false` 时只验证云端能够构建镜像，不推送构建结果。选择 `push=true` 时，工作流使用仓库 Secrets 登录阿里云北京 Registry，并将镜像推送到：

```text
registry.cn-beijing.aliyuncs.com/xk-repo/kkfive-client:<tag>
registry.cn-beijing.aliyuncs.com/xk-repo/kkfive-admin:<tag>
registry.cn-beijing.aliyuncs.com/xk-repo/kkfive-api:<tag>
```

需要在 GitHub 仓库的 **Settings → Secrets and variables → Actions → Secrets** 中配置：

```text
ALIYUN_DOCKER_USERNAME
ALIYUN_DOCKER_PASSWORD
```

阿里云容器镜像服务中需要提前创建命名空间 `xk-repo`，并确保账号或访问凭证具有推送三个镜像仓库的权限。运行时密钥应在部署阶段通过 Secrets、Compose、Kubernetes Secret 或目标平台配置注入，不能作为镜像构建参数传递。

## 不使用 Compose 时单独构建

### API

```bash
docker build \
  -f apps/api/Dockerfile \
  -t kkfive-api:local \
  .
```

### Client

```bash
docker build \
  -f apps/client/Dockerfile \
  --build-arg NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8787 \
  --build-arg API_BASE_URL=http://localhost:8787 \
  -t kkfive-client:local \
  .
```

### Admin

```bash
docker build \
  -f apps/admin/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8787 \
  -t kkfive-admin:local \
  .
```

直接使用 Docker CLI 时仍然必须从仓库根目录执行命令，并显式提供前端构建变量。

## 常见问题

### 提示缺少必填变量

例如：

```text
required variable NEXT_PUBLIC_API_URL is missing a value
```

确认根目录已创建 `.env`：

```bash
cp .env.example .env
docker compose config --quiet
```

### 无法拉取 `node:24-alpine`

如果出现 Docker Hub `EOF`、超时或网络错误，通常是镜像仓库连接问题。确认 Docker 网络、代理或镜像加速配置后重试：

```bash
docker pull node:24-alpine
docker compose build
```

### 端口已被占用

修改 `.env` 中对应的宿主机端口，例如：

```dotenv
CLIENT_PORT=3100
ADMIN_PORT=3101
API_PORT=8788
```

修改 `API_PORT` 时还需要同步调整浏览器使用的 `NEXT_PUBLIC_API_URL`，然后重新构建前端镜像。

### 浏览器请求了错误的 API 地址

检查构建时的 `NEXT_PUBLIC_API_URL`。该值已写入浏览器产物，修改后必须重新构建 Client 和 Admin：

```bash
docker compose build client admin
docker compose up -d client admin
```
