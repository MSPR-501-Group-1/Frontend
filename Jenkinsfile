pipeline {
    agent any

    environment {
        SONAR_PROJECT_KEY = 'mspr-frontend-admin-dashboard'
        IMAGE_NAME        = 'mspr/frontend-admin-dashboard'
        WORK_DIR          = 'healthai-admin'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                dir("${WORK_DIR}") {
                    sh 'npm ci'
                }
            }
        }

        stage('Lint') {
            steps {
                dir("${WORK_DIR}") {
                    sh 'npm run lint'
                }
            }
        }

        stage('Typecheck') {
            steps {
                dir("${WORK_DIR}") {
                    sh 'npm run typecheck'
                }
            }
        }

        stage('Build') {
            steps {
                dir("${WORK_DIR}") {
                    sh 'npm run build'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {
                        def scannerHome = tool 'SonarQube Scanner'
                        dir("${WORK_DIR}") {
                            sh """
                                ${scannerHome}/bin/sonar-scanner \
                                    -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                                    -Dsonar.sources=src \
                                    -Dsonar.exclusions="**/node_modules/**,**/dist/**" \
                                    -Dsonar.typescript.tsconfigPath=tsconfig.app.json
                            """
                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest ."
            }
        }
    }

    post {
        success {
            echo "Pipeline frontend-admin-dashboard : SUCCESS (build #${BUILD_NUMBER})"
        }
        failure {
            echo "Pipeline frontend-admin-dashboard : FAILURE (build #${BUILD_NUMBER})"
        }
        always {
            deleteDir()
        }
    }
}
