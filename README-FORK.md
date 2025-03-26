# 发布

```shell
# 如果环境没有 node 20+，可以使用docker
docker run --rm -it -v $(pwd):/work -w /work --entrypoint=/bin/bash node:20
yarn run build
yarn publish
```
