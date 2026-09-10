<div class="navicon">

    <?php
    include('../Models/ModelMenu2.php');
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