SUBDIRS = system0 core

all: $(SUBDIRS)

clean:
	$(MAKE) -C system0 clean
	$(MAKE) -C core clean

$(SUBDIRS):
	$(MAKE) -C $@

.PHONY: all clean $(SUBDIRS)
