# auto-annotation

![image](https://user-images.githubusercontent.com/22253556/118399160-cddb8f00-b696-11eb-890a-1202d5a78b93.png)

자동 어노테이션 기능을 탑재한 이미지 레이블링 툴

## 프로젝트 셋업

요구사항 node.js 12.14.1, yarn

```
yarn
```

## 일렉트론 실행

```
yarn electron:serve
```

## 구현 기능

- 바운딩 박스, 시멘틱 세그먼테이션
- TF.js 모델을 활용한 바운딩 박스 자동 어노테이션
- 모든 작업 취소/복원
- 다중 프로젝트 열기
- 자동 저장
- 다크 모드
