# 정밀 골격 모델

- `rtmpose-m_halpe26_256x192.onnx` — RTMPose-m (body7 학습, Halpe26 26관절: 발뒤꿈치·발끝 포함), 입력 256×192. OpenMMLab MMPose, Apache 2.0. 원본: OpenMMLab 공식 배포 ONNX(`rtmpose-m_simcc-body7_pt-body7-halpe26_700e-256x192`).
- GitHub Actions(`fetch-pose-model`)가 `MODELS.txt`에 적힌 주소에서 받아 넣습니다. 수동 실행: 저장소 → Actions → fetch-pose-model → Run workflow.
- 앱은 이 폴더 파일을 먼저 쓰고, 없으면 원본 주소에서 받습니다.
