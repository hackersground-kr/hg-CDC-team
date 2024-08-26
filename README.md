# CDC(씨다씨) - 노랑로당 🌻

해커그라운드 해커톤에 참여하는 CDC(씨다씨)팀의 노랑로당 🌻입니다.

## 참고 문서

> 아래 두 링크는 해커톤에서 앱을 개발하면서 참고할 만한 문서들입니다. 이 문서들에서 언급한 서비스 이외에도 더 많은 서비스들이 PaaS, SaaS, 서버리스 형태로 제공되니 참고하세요.

- [순한맛](./REFERENCES_BASIC.md)
- [매운맛](./REFERENCES_ADVANCED.md)

## 제품/서비스 소개

<!-- 아래 링크는 지우지 마세요 -->
[제품/서비스 소개 보기](TOPIC.md)
<!-- 위 링크는 지우지 마세요 -->

## 오픈 소스 라이센스

<!-- 아래 링크는 지우지 마세요 -->
[오픈소스 라이센스 보기](./LICENSE)
<!-- 위 링크는 지우지 마세요 -->

## 설치 방법

> **아래 제공하는 설치 방법을 통해 심사위원단이 여러분의 제품/서비스를 실제 Microsoft 애저 클라우드에 배포하고 설치할 수 있어야 합니다. 만약 아래 설치 방법대로 따라해서 배포 및 설치가 되지 않을 경우 본선에 진출할 수 없습니다.**

### 사전 준비 사항

- GitHub Account
- Visual Studio Code
- GitHub CLI
- Azure CLI
- Azure Developer CLI
- Azure Account
- Azure Resource Group
- Node js
- npm
- pnpm
- yarn
  
## 시작하기

### 백엔드 시작하기

> **Note**. Github Actions와 Bicep을 사용하였습니다

1. 이 리포지토리를 포크하고 다음 명령어로 클론합니다.

```ps1
$GITHUB_USERNAME = "{{자신의 GitHub ID}}"
git clone https://github.com/$GITHUB_USERNAME/hg-CDC-team.git
cd hg-CDC-team
```

2. 다음과 같이 에저를 프로비저닝 합니다. (윈도우 기준)

```ps1
(window)
$AZURE_ENV_NAME="CDC-team"
$AZURE_LOCATION="koreacentral"
$AZURE_RESOURCE_GROUP="rg-CDC-team"

(linux)
export AZURE_ENV_NAME="CDC-team"
export AZURE_LOCATION="koreacentral"
export AZURE_RESOURCE_GROUP="rg-CDC-team"
```

```ps1
az login # login -> enter

azd auth login # login
```

```ps1
azd init -e $AZURE_ENV_NAME
```

```ps1
azd env set AZURE_ENV_NAME $AZURE_ENV_NAME
azd env set AZURE_LOCATION $AZURE_LOCATION
azd env set AZURE_RESOURCE_GROUP $AZURE_RESOURCE_GROUP
azd config set alpha.resourceGroupDeployments on
```

3. azd up을 하기전 생성된 azure.yaml파일을 아래와 같이 수정해주세요.
#### azure.yaml
```ps1
name: hg-CDC-team

infra:
  provider: "bicep"
  path: "infra"
  module: "main"

pipeline:
  provider: "github"
```

4. Deploy
```ps1
azd up
```

5. 다음과 같이 github workflow 시크릿을 설정합니다. (윈도우 기준)

```ps1
# Nest.JS Deploy
az webapp deployment list-publishing-profiles --name "$AZURE_ENV_NAME-app" --resource-group $AZURE_RESOURCE_GROUP --xml > publish_profile.xml

gh auth login
gh secret set AZURE_APP_NAME --repo hackersground-kr/hg-CDC-team --body "$AZURE_ENV_NAME"
cat publish_profile.xml | gh secret set AZURE_WEBAPP_PUBLISH_PROFILE --repo hackersground-kr/hg-CDC-team

# AI Deploy
az webapp deployment list-publishing-profiles --name "$AZURE_ENV_NAME-ai" --resource-group $AZURE_RESOURCE_GROUP --xml > ai_publish_profile.xml

gh auth login
gh secret set AZURE_AI_APP_NAME --repo hackersground-kr/hg-CDC-team --body "${AZURE_ENV_NAME}-ai"
cat ai_publish_profile.xml | gh secret set AZURE_AI_WEBAPP_PUBLISH_PROFILE --repo hackersground-kr/hg-CDC-team
```

6. 포크한 리포지토리의 Github Push를 해 Actions를 활성화 해줍니다.

```
git add .
git commit -m "initial commit"
git push origin main
```

7. 깃허브에 접속해 github actions workflow를 실행을 확인합니다.

8. 배포가 완료될때까지 기다립니다. (10분 가량 소요됩니다.)

9.  다음과 같이 백엔드 배포를 확인합니다.

```ps1
iwr https://$AZURE_ENV_NAME-app.azurewebsites.net/api-docs
```

### 프론트엔드 시작하기

1. 프론트엔드 폴더로 이동해줍니다.

```
cd frontend # 경로의 유의 해주세요.
```

2. yarn 명령어를 입력해줍니다.

```
yarn
```

3. yarn 명령어를 이용해 프론트엔드를 시작해줍니다.

```
yarn start
```
