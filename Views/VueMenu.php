<div class="menu">

    <?php
    include('Models\ModelMenu.php');
    ?>
    <ul>
        <?php
        foreach ($menuItems as $item) { ?>
            <li>
                <a href="<?php echo $item['url']; ?>">
                    <img src="<?php echo $item['icon']; ?>" alt="<?php echo $item['name']; ?>" />
                    <?php echo $item['name']; ?>
                </a>
            </li>
        <?php } ?>
    </ul>
</div>