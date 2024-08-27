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

## AI 및 DB 시작하기

> **Note**. Github Actions와 Bicep을 사용하였습니다

1. 이 리포지토리를 포크하고 다음 명령어로 클론합니다.

```ps1
$GITHUB_USERNAME = "{{자신의 GitHub ID}}"
git clone https://github.com/$GITHUB_USERNAME/hg-CDC-team.git
cd hg-CDC-team
```

2. 다음과 같이 에저를 프로비저닝 합니다. (윈도우 기준)

```ps1
$AZURE_ENV_NAME="CDC-team"
$AZURE_LOCATION="koreacentral"
$AZURE_RESOURCE_GROUP="rg-CDC-team"

az login
azd auth login
azd init -e $AZURE_ENV_NAME
azd env set AZURE_ENV_NAME $AZURE_ENV_NAME
azd env set AZURE_LOCATION $AZURE_LOCATION
azd env set AZURE_RESOURCE_GROUP $AZURE_RESOURCE_GROUP
azd config set alpha.resourceGroupDeployments on

# azd up을 하기전 생성된 azure.yaml파일을 아래와 같이 수정해주세요.
name: hg-CDC-team

infra:
  provider: "bicep"
  path: "infra"
  module: "main"

pipeline:
  provider: "github"

# Deploy
azd up
```

3. 다음과 같이 github workflow 시크릿을 설정합니다. (윈도우 기준)

```ps1
# AI Deploy
az webapp deployment list-publishing-profiles --name "$AZURE_ENV_NAME-ai" --resource-group $AZURE_RESOURCE_GROUP --xml > ai_publish_profile.xml

gh auth login
gh secret set AZURE_AI_APP_NAME --repo hackersground-kr/hg-CDC-team --body "${AZURE_ENV_NAME}-ai"
cat ai_publish_profile.xml | gh secret set AZURE_AI_WEBAPP_PUBLISH_PROFILE --repo hackersground-kr/hg-CDC-team
```

4. 포크한 리포지토리의 Github Push를 해 Actions를 활성화 해줍니다.

```
git add .
git commit -m "initial commit"
git push origin main
```

5. 깃허브에 접속해 github actions workflow를 실행을 확인합니다.

6. 배포가 완료될때까지 기다립니다. (10분 가량 소요됩니다.)
7. 다음과 같이 백엔드 배포를 확인합니다.

```ps1
iwr https://$AZURE_ENV_NAME-ai.azurewebsites.net/location
```

### 백엔드 시작하기

1. 백엔드 폴더로 이동해줍니다.

```
cd backend # 경로의 유의 해주세요. (자신의 현재 경로에 맞게)
```

2. pnpm install 명령어를 입력해줍니다.

```
pnpm install
```

3. .env파일 설정하기 (값을 입력해주세요.)

```
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
JWT_SECRET=
JWT_ACCESS_TOKEN_EXPIRATION=
JWT_REFRESH_TOKEN_EXPIRATION=
CONNECTION_STRING=
```

4. 백엔드를 로컬에서 실행해줍니다.

```
pnpm start:dev
```

5. 깃허브 액션에서 사용할 시크릿을 사진과 같이 설정해줍니다.

<img width="885" alt="스크린샷 2024-08-27 오전 7 36 12" src="https://github.com/user-attachments/assets/d5ecd69f-57d3-4dd5-bfc8-15a5d774649c">

6. 깃허브 액션 파일이 작성되어있으니 `git push`를 통해 액션을 돌립니다.
   <img width="1785" alt="스크린샷 2024-08-27 오전 7 38 43" src="https://github.com/user-attachments/assets/2c97d756-3a44-407d-bb51-50a2c8469fe7">

   `다음과 같이 성공된 모습을 볼 수 있습니다.`

### 프론트엔드 시작하기

1. 프론트엔드 폴더로 이동해줍니다.

```

cd frontend # 경로의 유의 해주세요. (자신의 현재 경로에 맞게)

```

2. 환경변수를 설정해줍니다.

```

REACT_APP_KAKAO_KEY=746c698dca1feb40e6d1748fc65304af # 맵 키

```

3. yarn 명령어를 입력해줍니다.

```

yarn

```

4. yarn 명령어를 이용해 프론트엔드를 시작해줍니다.

```

yarn start # 로컬에서 잘 실행되는지 확인 해주세요.

```

5. 로컬에서 잘 실행된다면 배포단계로 넘어갑니다

<img alt="스크린샷 2024-08-27 오전 12 37 42" src="https://github.com/user-attachments/assets/affb9106-16b1-443b-af18-fd6e10b96c9b">

`Azure Portal에 접속해 App Service를 클릭합니다.`

<img width="317" alt="스크린샷 2024-08-27 오전 12 39 05" src="https://github.com/user-attachments/assets/b6ec7fb3-2331-43a2-8612-f8e36db7da83">

`App Service에서 만들기 > "웹 앱" 을 선택해줍니다.`
<img width="815" alt="스크린샷 2024-08-27 오전 12 40 07" src="https://github.com/user-attachments/assets/724efbb5-fdd2-4792-99be-c5c62490ba23">

`만들기 메뉴에서 위 사진과 같이 리소스 그룹, 인스턴스 정보 게시 등 별표가 있는 필수요소를 입력해줍니다.`
<img width="799" alt="스크린샷 2024-08-27 오전 12 40 57" src="https://github.com/user-attachments/assets/40491b82-efaf-44ba-a212-025adef90a70">
`다음으로 태그 를 입력해줍니다.`
<img width="466" alt="스크린샷 2024-08-27 오전 12 41 16" src="https://github.com/user-attachments/assets/b0871440-5736-4f68-b890-a3ff5b7f1112">

`마지막으로 검토 후 만들기를 누릅니다.`
<img width="411" alt="스크린샷 2024-08-27 오전 12 41 31" src="https://github.com/user-attachments/assets/e9a9b3d4-ea2c-4f4a-89af-58ffe385ccd9">

`생성이 될때 까지 잠시 기다린 후 Go to resource를 눌러줍니다. (리소스 보러 가기)`

<img width="673" alt="스크린샷 2024-08-27 오전 12 41 41" src="https://github.com/user-attachments/assets/5d695642-f69f-43a8-a2d7-60d913b17179">

`다음으로 VSCode를 열어주고 위의 3가지 익스텐션을 설치 해줍니다.`

<img width="338" alt="스크린샷 2024-08-27 오전 12 41 49" src="https://github.com/user-attachments/assets/42be9130-0c8c-4868-9094-594fe27afb6f">

`설치 후 Azure Icon을 눌러서 Sign in to Azure를 눌러줍니다.`

<img width="244" alt="스크린샷 2024-08-27 오전 12 42 09" src="https://github.com/user-attachments/assets/a4633d80-c26a-48e1-b875-bbccc2257562">

`Azure에 로그인 후 AppService Icon을 눌러 주고 배포할 AppService를 오른쪽 클릭해  Deploy to WEB App을 클릭해 줍니다.`
<img width="496" alt="스크린샷 2024-08-27 오전 12 42 16" src="https://github.com/user-attachments/assets/a2014fbe-35b9-4cc2-8567-a95985c0af14">

`다음으로 Browser로 클릭해주고 "빌드한" 리액트 프로젝트의 "build 폴더" 를 클릭해줍니다.`

<img width="291" alt="스크린샷 2024-08-27 오전 12 42 56" src="https://github.com/user-attachments/assets/fd52d258-7520-40be-b09e-06b6c8c5e40b">

`그 후 Deploy와 Browse Website를 눌러 배포 상태를 확인합니다.`

<img width="1782" alt="스크린샷 2024-08-27 오전 7 13 26" src="https://github.com/user-attachments/assets/84a133f0-a834-4a5f-9589-9f523beec95a">

`다음과 같이 배포가 잘 된 모습을 볼 수 있습니다.`

```

```
