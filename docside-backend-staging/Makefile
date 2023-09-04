.PHONY: build-RuntimeDependenciesLayer build-lambda-common
.PHONY: build-getAllItemsFunction build-getByIdFunction build-putItemFunction

build-createUser:
	$(MAKE) HANDLER=src/users/create.ts build-lambda-common
build-createMe:
	$(MAKE) HANDLER=src/users/create.ts build-lambda-common
build-findOneUser:
	$(MAKE) HANDLER=src/users/findOne.ts build-lambda-common
build-findAllUser:
	$(MAKE) HANDLER=src/users/findAll.ts build-lambda-common
build-findMe:
	$(MAKE) HANDLER=src/users/findOne.ts build-lambda-common
build-findOneByEmail:
	$(MAKE) HANDLER=src/users/findOne.ts build-lambda-common
build-deleteUser:
	$(MAKE) HANDLER=src/users/delete.ts build-lambda-common
build-deleteMe:
	$(MAKE) HANDLER=src/users/delete.ts build-lambda-common
build-updateUser:
	$(MAKE) HANDLER=src/users/update.ts build-lambda-common
build-updateMe:
	$(MAKE) HANDLER=src/users/update.ts build-lambda-common
build-userUploadAvatar:
	$(MAKE) HANDLER=src/users/uploadAvatar.ts build-lambda-common
build-setPin:
	$(MAKE) HANDLER=src/unlock/create.ts build-lambda-common
build-verifyPin:
	$(MAKE) HANDLER=src/unlock/verify.ts build-lambda-common
build-deletePin:
	$(MAKE) HANDLER=src/unlock/delete.ts build-lambda-common
build-setUnlockMethod:
	$(MAKE) HANDLER=src/unlock/unlockMethod.ts build-lambda-common
build-findOneCall:
	$(MAKE) HANDLER=src/calls/findOne.ts build-lambda-common
build-findAllCalls:
	$(MAKE) HANDLER=src/calls/findAll.ts build-lambda-common
build-deleteCall:
	$(MAKE) HANDLER=src/calls/delete.ts build-lambda-common
build-updateCall:
	$(MAKE) HANDLER=src/calls/update.ts build-lambda-common
build-createCall:
	$(MAKE) HANDLER=src/calls/create.ts build-lambda-common
build-findOneChannel:
	$(MAKE) HANDLER=src/channels/findOne.ts build-lambda-common
build-findAllChannel:
	$(MAKE) HANDLER=src/channels/findAll.ts build-lambda-common
build-findChannelMembers:
	$(MAKE) HANDLER=src/channels/findChannelMembers.ts build-lambda-common
build-findAllUserChannel:
	$(MAKE) HANDLER=src/channels/findAll.ts build-lambda-common
build-deleteChannel:
	$(MAKE) HANDLER=src/channels/delete.ts build-lambda-common
build-updateChannel:
	$(MAKE) HANDLER=src/channels/update.ts build-lambda-common
build-archiveUnarchiveChannel:
	$(MAKE) HANDLER=src/channels/update.ts build-lambda-common
build-unreadReadChannel:
	$(MAKE) HANDLER=src/channels/update.ts build-lambda-common
build-createChannel:
	$(MAKE) HANDLER=src/channels/create.ts build-lambda-common
build-channelUploadAvatar:
	$(MAKE) HANDLER=src/channels/uploadAvatar.ts build-lambda-common
build-createEventType:
	$(MAKE) HANDLER=src/eventty/create.ts build-lambda-common
build-findAllEventTypes:
	$(MAKE) HANDLER=src/eventty/findAll.ts build-lambda-common
build-deleteEventType:
	$(MAKE) HANDLER=src/eventty/delete.ts build-lambda-common
build-findOneEventType:
	$(MAKE) HANDLER=src/eventty/findOne.ts build-lambda-common
build-updateEventType:
	$(MAKE) HANDLER=src/eventty/update.ts build-lambda-common
build-createWorkingHours:
	$(MAKE) HANDLER=src/workinghours/create.ts build-lambda-common
build-findMyWorkingHour:
	$(MAKE) HANDLER=src/workinghours/findOne.ts build-lambda-common
build-updateMyWorkingHour:
	$(MAKE) HANDLER=src/workinghours/update.ts build-lambda-common
build-createAppointment:
	$(MAKE) HANDLER=src/appointment/create.ts build-lambda-common
build-findAllAppointment:
	$(MAKE) HANDLER=src/appointment/findAll.ts build-lambda-common
build-findOneAppointment:
	$(MAKE) HANDLER=src/appointment/findOne.ts build-lambda-common
build-deleteAppointment:
	$(MAKE) HANDLER=src/appointment/delete.ts build-lambda-common
build-updateAppointment:
	$(MAKE) HANDLER=src/appointment/update.ts build-lambda-common
build-createStripeCheckoutSession:
	$(MAKE) HANDLER=src/payments/create.ts build-lambda-common
build-handleStripeWebhooks:
	$(MAKE) HANDLER=src/payments/webhook.ts build-lambda-common
build-refundByStripePaymentIntent:
	$(MAKE) HANDLER=src/payments/refund.ts build-lambda-common
build-findProviders:
	$(MAKE) HANDLER=src/providers/findAll.ts build-lambda-common
build-updateProvider:
	$(MAKE) HANDLER=src/providers/update.ts build-lambda-common
build-lambda-common:
	npm install
	rm -rf dist
	echo "{\"extends\": \"./tsconfig.json\", \"include\": [\"${HANDLER}\"] }" > tsconfig-only-handler.json
	npm run build -- --build tsconfig-only-handler.json
	cp -r dist "$(ARTIFACTS_DIR)/"

build-RuntimeDependenciesLayer:
	mkdir -p "$(ARTIFACTS_DIR)/nodejs"
	cp package.json package-lock.json "$(ARTIFACTS_DIR)/nodejs/"
	npm install --production --prefix "$(ARTIFACTS_DIR)/nodejs/"
	rm "$(ARTIFACTS_DIR)/nodejs/package.json" # to avoid rebuilding when changes doesn't relate to dependencies
