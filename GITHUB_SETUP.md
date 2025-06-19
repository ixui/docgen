# GitHub Repository Setup Guide

このガイドでは、DocGenをGitHubプライベートリポジトリでNPMパッケージとして社内利用するためのセットアップ手順を説明します。

## 前提条件

- GitHub Enterprise または GitHub.com のアカウント
- リポジトリの管理者権限
- Node.js 18.0.0以上

## 1. GitHubリポジトリの作成

1. GitHubで新しいプライベートリポジトリを作成
2. リポジトリ名: `docgen` (または任意の名前)
3. 組織アカウントで作成することを推奨

## 2. package.jsonの設定確認

`package.json`の以下の項目を確認し、必要に応じて修正してください：

```json
{
  "name": "@your-company/docgen",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/your-company/docgen.git"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

**重要**: `@your-company` を実際の組織名に置き換えてください。

## 3. GitHub Actionsの有効化

1. リポジトリの Settings → Actions → General
2. "Allow all actions and reusable workflows" を選択
3. Workflow permissions で "Read and write permissions" を有効化

## 4. ブランチ保護ルールの設定 (オプション)

1. Settings → Branches → Add rule
2. Branch name pattern: `main` または `master`
3. 以下を有効化：
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Include administrators

## 5. チームアクセス権限の設定

### 開発者向け (読み取りアクセス)
1. Settings → Manage access → Add teams
2. 該当チームを追加し、`Read` 権限を付与

### パッケージアクセス
1. Organization settings → Packages
2. Package visibility を `Private` に設定
3. 必要な チーム/ユーザーに `Read` 権限を付与

## 6. リリースプロセス

### 自動リリース (推奨)

1. バージョンアップ
```bash
npm version patch  # パッチバージョンアップ
npm version minor  # マイナーバージョンアップ
npm version major  # メジャーバージョンアップ
```

2. タグをプッシュ
```bash
git push origin --tags
```

3. GitHub Actionsが自動的にパッケージを公開

### 手動リリース

1. GitHub Actions タブ → Publish to GitHub Packages
2. "Run workflow" をクリック
3. ブランチを選択して実行

## 7. 社内利用者向けセットアップ

### 初回設定

各利用者は以下の設定を行う必要があります：

1. Personal Access Token の作成
   - GitHub Settings → Developer settings → Personal access tokens
   - `packages:read` スコープを付与

2. `.npmrc` ファイルの設定
```bash
# ホームディレクトリまたはプロジェクトルートに作成
echo "@your-company:registry=https://npm.pkg.github.com" >> ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_TOKEN_HERE" >> ~/.npmrc
```

### インストール

```bash
# グローバルインストール
npm install -g @your-company/docgen

# プロジェクトローカルインストール
npm install --save-dev @your-company/docgen
```

## 8. トラブルシューティング

### よくある問題

1. **403 Forbidden エラー**
   - Personal Access Token の権限を確認
   - トークンの有効期限を確認
   - Organization の Package 設定を確認

2. **404 Not Found エラー**
   - パッケージ名の確認 (`@organization/package-name`)
   - レジストリ設定の確認

3. **認証エラー**
   - `.npmrc` ファイルの設定を確認
   - 環境変数 `NODE_AUTH_TOKEN` の設定を確認

### ログの確認

```bash
# npm の詳細ログを有効化
npm config set loglevel verbose

# インストール時のログを確認
npm install @your-company/docgen --verbose
```

## 9. セキュリティ考慮事項

- Personal Access Token は安全に管理
- トークンの定期的な更新
- 不要なアクセス権限の削除
- パッケージアクセスログの定期的な確認

## 10. メンテナンス

### 定期的なタスク

- 依存関係の更新
- セキュリティアップデート
- アクセス権限の見直し
- 使用状況の監視

### モニタリング

- GitHub Insights でパッケージダウンロード数を確認
- Security alerts の定期確認
- Dependabot alerts への対応

## サポート

設定に関する質問やトラブルシューティングが必要な場合は、GitHubのIssuesページでお問い合わせください。