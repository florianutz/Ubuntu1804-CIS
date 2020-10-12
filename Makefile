# Makefile for Ubuntu1804-CIS
.PHONY: help
help:
	@echo
	@echo This Makefile is used to test this role. Typical use:
	@echo
	@echo '   make test'
	@echo '   make clean'
	@echo '   make travis'
	@echo
	@echo
	@echo To use the isolated environment from this directory:
	@echo
	@echo '   make venv'
	@echo '   . bin/activate'
	@echo
	@echo Molecule has built-in help
	@echo
	@echo

# virtualenv allows isolation of python libraries
.PHONY: venv
venv: bin/python

.PHONY: bin/python
bin/python:
	pip -V || sudo easy_install pip
	# virtualenv allows isolation of python libraries
	virtualenv --version || sudo easy_install virtualenv
	# Now with those two we can isolate our test setup.
	virtualenv venv
	venv/bin/pip install -r requirements.txt

# cleanup virtualenv and molecule leftovers
.PHONY: clean
clean:
	rm -rf .molecule venv molecule/default/cache

.PHONY: test
test: bin/python
	( . venv/bin/activate && venv/bin/molecule test )

.PHONY: travis
travis:
	pip install -r requirements.txt
	molecule test
