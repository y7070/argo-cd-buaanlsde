# BUAANLSDE Refactor

## 部署方式

注意：这是基于集群中已有 argocd 情况的部署

如果没有 argocd 部署如下额外 yaml:
```
kubectl apply -f ./manifests/crds/application-crd.yaml
kubectl apply -f ./manifests/crds/appproject-crd.yaml
kubectl apply -f ./manifests/cluster-rbac/argocd-application-controller-clusterrole.yaml
kubectl apply -f ./manifests/cluster-rbac/argocd-server-clusterrole.yaml
```

镜像 `gitlab.buaanlsde.cn:4567/buaapyj/registry/argocd:v1.8.7-rc4` 会使用 `https://resource-server.ingress.isa.buaanlsde.cn` 来访问 resource-server

``` bash
NAMESPACE=argocd-sig
IMAGE=gitlab.buaanlsde.cn:4567/buaapyj/registry/argocd:v1.8.7-rc4

kubectl create ns ${NAMESPACE}

sed -e "s/NAMESPACE/${NAMESPACE}/g" -e "s#IMAGE#${IMAGE}#g" ./manifests/install-with-exists.yaml |  
    kubectl apply -n ${NAMESPACE} -f -


sed -e "s/NAMESPACE/${NAMESPACE}/g" ./manifests/ingress.yaml | kubectl apply -n ${NAMESPACE} -f -

kubectl -n argocd-sig patch secret argocd-secret \
  -p '{"stringData": {
    "admin.password": "$2a$10$HnK0KqNxvUpEi4Ji.AsVjOcPmnM4CC5U7oAe1ZDJnHZ95WIV2Lywy",
    "admin.passwordMtime": "'$(date +%FT%T%Z)'"
  }}'
```

### uninstallation
``` bash
NAMESPACE=argocd-sig
IMAGE=gitlab.buaanlsde.cn:4567/buaapyj/registry/argocd:v1.8.7-rc4

sed -e "s/NAMESPACE/${NAMESPACE}/g" -e "s#IMAGE#${IMAGE}#g" ./manifests/install-with-exists.yaml |  
    kubectl delete -n ${NAMESPACE} -f -
```

### json 接口
``` json
{
  "allocatable": {
    "cpu": "10",
    "memory": "10Gi"
  },
  "requested": {
    "cpu": "8",
    "memory": "8Gi"
  },
  "ratio": "12.32%"
}
```

---

[![Integration tests](https://github.com/argoproj/argo-cd/workflows/Integration%20tests/badge.svg?branch=master)](https://github.com/argoproj/argo-cd/actions?query=workflow%3A%22Integration+tests%22)
[![slack](https://img.shields.io/badge/slack-argoproj-brightgreen.svg?logo=slack)](https://argoproj.github.io/community/join-slack)
[![codecov](https://codecov.io/gh/argoproj/argo-cd/branch/master/graph/badge.svg)](https://codecov.io/gh/argoproj/argo-cd)
[![Release Version](https://img.shields.io/github/v/release/argoproj/argo-cd?label=argo-cd)](https://github.com/argoproj/argo-cd/releases/latest)

# Argo CD - Declarative Continuous Delivery for Kubernetes

## What is Argo CD?

Argo CD is a declarative, GitOps continuous delivery tool for Kubernetes.

![Argo CD UI](docs/assets/argocd-ui.gif)

## Why Argo CD?

1. Application definitions, configurations, and environments should be declarative and version controlled.
1. Application deployment and lifecycle management should be automated, auditable, and easy to understand.

## Who uses Argo CD?

[Official Argo CD user list](USERS.md)

## Documentation

To learn more about Argo CD [go to the complete documentation](https://argoproj.github.io/argo-cd/).
Check live demo at https://cd.apps.argoproj.io/.

## Community Blogs and Presentations

1. [Environments Based On Pull Requests (PRs): Using Argo CD To Apply GitOps Principles On Previews](https://youtu.be/cpAaI8p4R60)
1. [Argo CD: Applying GitOps Principles To Manage Production Environment In Kubernetes](https://youtu.be/vpWQeoaiRM4)
1. [Tutorial: Everything You Need To Become A GitOps Ninja](https://www.youtube.com/watch?v=r50tRQjisxw) 90m tutorial on GitOps and Argo CD.
1. [Comparison of Argo CD, Spinnaker, Jenkins X, and Tekton](https://www.inovex.de/blog/spinnaker-vs-argo-cd-vs-tekton-vs-jenkins-x/)
1. [Simplify and Automate Deployments Using GitOps with IBM Multicloud Manager 3.1.2](https://medium.com/ibm-cloud/simplify-and-automate-deployments-using-gitops-with-ibm-multicloud-manager-3-1-2-4395af317359)
1. [GitOps for Kubeflow using Argo CD](https://v0-6.kubeflow.org/docs/use-cases/gitops-for-kubeflow/)
1. [GitOps Toolsets on Kubernetes with CircleCI and Argo CD](https://www.digitalocean.com/community/tutorials/webinar-series-gitops-tool-sets-on-kubernetes-with-circleci-and-argo-cd)
1. [Simplify and Automate Deployments Using GitOps with IBM Multicloud Manager](https://www.ibm.com/blogs/bluemix/2019/02/simplify-and-automate-deployments-using-gitops-with-ibm-multicloud-manager-3-1-2/)
1. [CI/CD in Light Speed with K8s and Argo CD](https://www.youtube.com/watch?v=OdzH82VpMwI&feature=youtu.be)
1. [Machine Learning as Code](https://www.youtube.com/watch?v=VXrGp5er1ZE&t=0s&index=135&list=PLj6h78yzYM2PZf9eA7bhWnIh_mK1vyOfU). Among other things, describes how Kubeflow uses Argo CD to implement GitOPs for ML
1. [Argo CD - GitOps Continuous Delivery for Kubernetes](https://www.youtube.com/watch?v=aWDIQMbp1cc&feature=youtu.be&t=1m4s)
1. [Introduction to Argo CD : Kubernetes DevOps CI/CD](https://www.youtube.com/watch?v=2WSJF7d8dUg&feature=youtu.be)
1. [GitOps Deployment and Kubernetes - using ArgoCD](https://medium.com/riskified-technology/gitops-deployment-and-kubernetes-f1ab289efa4b)
1. [Deploy Argo CD with Ingress and TLS in Three Steps: No YAML Yak Shaving Required](https://itnext.io/deploy-argo-cd-with-ingress-and-tls-in-three-steps-no-yaml-yak-shaving-required-bc536d401491)
1. [GitOps Continuous Delivery with Argo and Codefresh](https://codefresh.io/events/cncf-member-webinar-gitops-continuous-delivery-argo-codefresh/)
