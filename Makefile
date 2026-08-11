.PHONY: version

version:
	@LAST_TAG=$$(git describe --tags --abbrev=0 2>/dev/null); \
	if [ -z "$$LAST_TAG" ]; then \
		LAST_TAG="v0.0.0"; \
		COMMITS=$$(git log --oneline 2>/dev/null); \
	else \
		COMMITS=$$(git log $$LAST_TAG..HEAD --oneline 2>/dev/null); \
	fi; \
	if [ -z "$$COMMITS" ]; then \
		echo "no commits since last tag ($$LAST_TAG)"; \
		exit 0; \
	fi; \
	HAS_FEATURE=$$(echo "$$COMMITS" | grep -cE "^[^ ]+ feature:"); \
	HAS_PATCH=$$(echo "$$COMMITS" | grep -cE "^[^ ]+ (fix|config|docs):"); \
	if [ "$$HAS_FEATURE" -eq 0 ] && [ "$$HAS_PATCH" -eq 0 ]; then \
		echo "no usable commits since last tag ($$LAST_TAG)"; \
		exit 0; \
	fi; \
	MAJOR=$$(echo $$LAST_TAG | sed 's/v//' | cut -d. -f1); \
	MINOR=$$(echo $$LAST_TAG | sed 's/v//' | cut -d. -f2); \
	PATCH=$$(echo $$LAST_TAG | sed 's/v//' | cut -d. -f3); \
	if [ "$$HAS_FEATURE" -gt 0 ]; then \
		MINOR=$$((MINOR + 1)); \
		PATCH=0; \
	else \
		PATCH=$$((PATCH + 1)); \
	fi; \
	NEW_TAG="v$$MAJOR.$$MINOR.$$PATCH"; \
	NEW_VER="$$MAJOR.$$MINOR.$$PATCH"; \
	node -e "const fs=require('fs'),p=JSON.parse(fs.readFileSync('package.json','utf8'));p.version='$$NEW_VER';fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\n','utf8');"; \
	git add package.json; \
	git commit -m "config: bump version to $$NEW_TAG"; \
	git tag $$NEW_TAG; \
	echo "tagged $$LAST_TAG -> $$NEW_TAG"


